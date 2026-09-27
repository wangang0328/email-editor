# 编辑画布 stableId 交互体系 + Worker 编译架构方案

> **状态**：PR-1～PR-4 已落地；侧栏属性 → 画布更新已验收。编辑 Tab 编译暂走**主线程**（Worker 仅 preview）；PR-5 reannotateIdx 待做。  
> **关联文档**：[编辑画布渲染优化方案.md](./编辑画布渲染优化方案.md)（① 编译 + ② 挂载基础）  
> **代码现状**：`eeUid` + `data-ee-uid` + BlockIndexRegistry + reorder 零编译已启用；交互层 click/hover/drag 走 uid→idx；`MjmlDomRender` 由 `form.subscribe` 驱动管线。

---

## 1. 为什么要做这套改造

### 1.1 已验证的问题

| 现象 | 根因 |
|------|------|
| move 后点击某些块无聚焦 | 交互从 DOM 读 `node-idx-content.children.[N]`，move 后 class 仍是旧位置 |
| 拖拽位置有时不对 | `getInsertPosition` 基于 DOM 上的旧 idx 计算 |
| 拖拽卡顿 | MJML 全量编译 + 整页 postProcess 在主线程阻塞（~500ms + ~800ms） |
| 「reorder 只搬 DOM」不稳定 | 未改交互层就搬 DOM → idx 与 JSON 脱节（已回退） |

### 1.2 目标

| 场景 | 目标耗时 | 主线程 |
|------|----------|--------|
| move / reorder（仅顺序变） | **< 20ms** | 零编译、零 postProcess，只搬 DOM |
| 改 padding / 颜色等属性 | **< 100ms** | 段级 L2 + segment morph（**当前**：主线程 compile + morph） |
| 增删 section | **< 600ms 出结果** | **目标**：Worker 编译；**当前** edit 仍主线程 |
| 富文本打字 | **0 挂载** | L3 冻结 DOM |

---

## 2. 核心概念：两套标识

```
┌──────────────────────────────────────────────────────────────────┐
│  eeUid（data-ee-uid）          │  idx（node-idx-* class）         │
├────────────────────────────────┼──────────────────────────────────┤
│  块是谁（身份）                 │  块在 JSON 树里哪（位置路径）      │
│  创建后永久不变                 │  move / 增删后变化               │
│  存在：data.value.eeUid        │  存在：MJML css-class + postProcess │
│                                │       data-content_editable-idx   │
│  用于：DOM 复用、morph key      │  用于：form Field 路径、JsonToMjml │
│  用于：点击/hover/drag 定位     │  （目标态：由 Registry 派生，      │
│                                │   不直接从 DOM class 读）          │
└────────────────────────────────┴──────────────────────────────────┘
```

**原则**：

1. **DOM 身份对齐**用 `data-ee-uid`（morphdom `getNodeKey`、查找块节点）。
2. **写 form** 用 `idx` 路径，但由 `BlockIndexRegistry.uidToIdx(uid)` 实时算出，**不读 DOM 上可能过期的 node-idx class**。
3. **L2 缓存 HTML** 按 `uid + subtreeHash` 存内容；**reorder 路径禁止使用 L2 片段**（片段内 baked-in 旧 idx）。

---

## 3. 总体架构

```
                         pageData 变化（form / 拖放 / 侧栏）
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  BlockIndexRegistry.rebuild   │
                    │  uid ↔ idx / parent / segment │
                    └───────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        交互层（主线程）      MountPlan（同步）      编译层
    click/hover/drag 读 uid   判定走哪条路径        mjml → HTML
    uid → idx → setFocusIdx   < 1ms                 edit：主线程 L1/L2
              │                     │                 preview：Worker（可选）
              │                     │                     │
              │                     ▼                     │
              │            commitMountPlan                │
              │         noop / reorder / segment          │
              │         morph-full / full                 │
              │                     ▲                     │
              │                     └──── html ───────────┘
              ▼
         Shadow DOM 画布
```

### 3.1 模块职责

| 模块 | 包 | 职责 |
|------|-----|------|
| `stableId.ts` | email-editor-shared | `eeUid` 创建、注入 map |
| `BlockIndexRegistry` | email-editor-shared 或 editor | pageData → uid/idx 双向索引 |
| `compileWithRenderCache` | editor/render-cache | L1/L2/L3；preview 可走 Worker，**edit 暂主线程** |
| `buildMountPlan` | editor/canvas-mount | 同步决策挂载模式 |
| `commitMountPlan` | editor/canvas-mount | reorder / segment morph / morph-full |
| `postProcessEmailHtml` | editor/canvas-mount | 注入 uid、contenteditable、data-selector |
| `useDropBlock` | editor | 画布事件；**改为 uid 入口** |
| `MjmlDomRender` | editor | 编排 compile + mount |

### 3.2 与现有文档的关系

| 文档阶段 | 本文档阶段 |
|----------|------------|
| 去掉 HtmlStringToReactNodes | 已完成方向 |
| L1/L2/L3 + segment morph | 保留；L2 key 改为 uid+hash |
| M1 段级 DOM | 保留；新增 **reorder** 模式 |
| stableId「待做」 | **本文档完整设计** |

---

## 4. BlockIndexRegistry（运行时索引）

### 4.1 数据结构

```ts
interface BlockIndexEntry {
  uid: string;
  idx: string;              // content.children.[2].children.[0]
  type: string;
  parentUid: string | null;
  segmentUid: string | null; // 所属 section/hero 段根
  childUids: string[];
}

interface BlockIndexRegistry {
  rebuild(pageData: IBlockData): void;
  uidToIdx(uid: string): string | null;
  idxToUid(idx: string): string | null;
  getEntry(uid: string): BlockIndexEntry | null;
  segmentOrder(): string[];           // 按 pageData 文档序的 segment uid 列表
  childrenOrder(parentUid: string): string[];
}
```

### 4.2 何时 rebuild

- `EmailEditorProvider` 初始化 `content` 后
- 任意 `form.change` 导致 `values.content` 引用变化后（可在 `EditorContext` 或 `MjmlDomRender` 入口统一调用）
- 复杂度 O(块数)，典型 < 1ms

### 4.3 挂载位置

```ts
// EditorContext 或专用 Provider
const registryRef = useRef(new BlockIndexRegistry());

useEffect(() => {
  ensurePageBlockStableIds(content);
  registryRef.current.rebuild(content);
}, [content]);
```

导出：`useBlockIndex()` → `{ registry, uidToIdx, idxToUid, getBlockNodeByUid }`

---

## 5. DOM 查找与交互改造

### 5.1 新 API（保留旧 API 作兼容层）

| API | 说明 |
|-----|------|
| `getBlockUidFromElement(el)` | `el.closest('[data-ee-uid]')` |
| `getBlockNodeByUid(uid)` | Shadow DOM `querySelector([data-ee-uid="..."])` |
| `getBlockNodeByChildEle(target)` | 向上找 uid，**不再优先 node-idx class** |
| `getBlockNodeByIdx(idx)` | 内部 `idxToUid(idx)` → `getBlockNodeByUid` |

### 5.2 contenteditable 字段路径

**现状（有问题）**：`data-content_editable-idx` 存完整 form 路径，move 后过期。

**目标**：

```html
<div data-ee-uid="uuid-a" data-content-field="data.value.content" contenteditable="true">
```

```ts
const uid = active.getAttribute('data-ee-uid');
const field = active.getAttribute('data-content-field');
const idx = registry.uidToIdx(uid);
const formPath = `${idx}.${field}`;
```

### 5.3 需改造的调用点（实施清单）

| 优先级 | 文件 | 改造 |
|--------|------|------|
| P0 | `useDropBlock.ts` | pointerdown / mouseover / dragover：uid → uidToIdx → setFocusIdx |
| P0 | `getBlockNodeByChildEle.ts` | 优先 data-ee-uid |
| P0 | `getInsertPosition.ts` | 新增 `getInsertPositionByUid`，内部转 idx |
| P1 | `FocusBlockLayoutProvider` | 支持 focusUid 或 idx 经 registry 找 DOM |
| P1 | `FocusTooltip` / `HoverTooltip` | getBlockNodeByUid |
| P1 | `RichTextField` | data-content-field + registry |
| P2 | `useHotKeys.ts` | uid → idx |
| P2 | `BlockLayer` / `useAvatarWrapperDrop` | 同上 |
| P2 | `RichTextToolBar` / `FontWeight` | getBlockNodeByUid |

### 5.4 focus 状态（可选演进）

- **阶段 1**：state 仍用 `focusIdx`，事件入口 uid → idx 再 set
- **阶段 2**：state 改 `focusUid`，侧栏 `uidToIdx(focusUid)` 拼 Field name（move 后 focus 不断）

---

## 6. 挂载层：MountPlan 模式

### 6.1 模式定义

```ts
type SegmentSnapshot = {
  segmentUidOrder: string[];      // segment 顺序（uid）
  hashes: Record<string, string>; // uid → subtreeHash
};

type MountMode =
  | 'noop'        // 顺序 + 所有 hash 未变
  | 'reorder'     // 仅 segment 顺序变，hash 全未变 → 零编译
  | 'segment'     // 部分 segment hash 变 → 段 morph
  | 'morph-full'  // 增删段 / 不可缓存 / 需整页刷新
  | 'full';       // 冷启动 innerHTML
```

### 6.2 决策树（每次 pageData 变化）

```
pageData 变化
    │
    ▼
registry.rebuild(pageData)
    │
    ▼
buildMountPlan(pageData, container, prevSnapshot)
    │
    ├─ 无 prev / 冷启动 ──────────────────────────► full
    │
    ├─ segment uid 集合变化（增删）──────────────────► morph-full（需 Worker 编译）
    │
    ├─ segmentUidOrder 变化 && 所有 hash 未变 ───────► reorder（零编译）
    │
    ├─ 部分 hash 变 && 顺序未变 && live DOM 齐全 ───► segment
    │
    ├─ hash 变 + 顺序也变 ──────────────────────────► morph-full
    │
    ├─ 含 condition/iteration 不可缓存段 ───────────► morph-full
    │
    └─ 全未变 ─────────────────────────────────────► noop
```

### 6.3 各模式提交行为

| 模式 | 编译 | postProcess | DOM 操作 |
|------|------|-------------|----------|
| noop | 无 | 无 | 无 |
| reorder | **无** | **无** | `reorderSegmentDomByUid` |
| segment | L2/Worker 未变段跳过 | 整页一次或段切片 | 段级 morphdom（key=uid） |
| morph-full | Worker 全量/增量 | 整页一次 | morphdom childrenOnly（key=uid） |
| full | Worker 或主线程 | 整页 | innerHTML |

### 6.4 reorder 后 node-idx class 怎么办

| 策略 | 说明 |
|------|------|
| **最小（推荐先做）** | class 暂时 stale；交互不读 class，仅 uid |
| **可选增强** | `reannotateSubtreeByRegistry(container, registry)`：按当前 idx 重写 node-idx、data-selector、contenteditable 路径，**不跑 mjml** |

---

## 7. 缓存策略（L1 / L2 / L3）

### 7.1 Key 设计

| 层级 | Key | 说明 |
|------|-----|------|
| L1 | pageFingerprint | 整页 JSON + profile + dataSource |
| L2 | **uid + subtreeHash** + profile + engine | 内容身份，**不含 idx** |
| L3 | pageFingerprint + 冻结 html | 富文本聚焦 |

### 7.2 L2 与 reorder 的边界（重要）

```
❌ 错误：move 后 L2 命中 uid+hash → 注入旧 HTML（内含 node-idx-...[0]）→ class 错乱

✓ 正确：
  - reorder 路径：不读 L2，只搬 live DOM
  - segment 路径：块未 move，idx 未变，L2 片段与 live 一致
  - morph-full：Worker 产出带新 idx 的 HTML，morphdom 按 uid 匹配并 patch class
```

### 7.3 L2 组装（属性变更）

与现 `segmentAssembly.ts` 类似，但：

- 缓存 key：`buildL2Key(segment.uid, segment.subtreeHash, ...)`
- 替换 HTML 时：在**当前 baseline** 上按 **uid** 定位段（非 idx），或仍用 idx 切片但仅当 **顺序未变** 时

---

## 8. Web Worker 编译层

### 8.1 为什么仍需要 Worker

- reorder 零编译只覆盖 **纯 move**
- 增删段、改属性、move+改内容 仍需 mjml → HTML
- Worker 价值：**主线程不阻塞**，拖拽/hover/输入保持 60fps

### 8.2 分工

| 操作 | Worker | 主线程 |
|------|--------|--------|
| move only | 不调用 | reorder DOM |
| 改 padding | 编译该 uid 段（或 L2 命中跳过） | postProcess 切片 + segment morph |
| 增删 section | 全量/增量 compile | morph-full |
| postProcess | **不做**（要访问 DOMParser/文档） | 必须 |
| morphdom | **不做** | 必须 |

### 8.3 消息协议

```ts
// Main → Worker
interface CompileRequest {
  type: 'compile';
  jobId: number;
  pageData: IBlockData;
  profile: 'edit' | 'preview';
  dataSource?: Record<string, unknown>;
  mode: 'full' | 'segments';
  segmentUids?: string[];
}

// Worker → Main
interface CompileResult {
  type: 'result';
  jobId: number;
  html: string;
  segmentHtml?: Record<string, string>; // uid → outerHTML
  pipelineMs: number;
  hitLevel: 'L1' | 'L2' | 'miss';
}

interface CompileError {
  type: 'error';
  jobId: number;
  message: string;
}
```

### 8.4 取消与串行

```ts
let latestJobId = 0;

function requestCompile(pageData) {
  const jobId = ++latestJobId;
  worker.postMessage({ type: 'compile', jobId, pageData, ... });
}

worker.onmessage = (e) => {
  if (e.data.jobId !== latestJobId) return; // 丢弃过期结果
  mountEditCanvas({ rawHtml: e.data.html, ... });
};
```

### 8.5 Vite 集成要点

- `compile.worker.ts` 独立 entry
- `fullCompileToHtml` 及依赖（JsonToMjml、mjml-browser）打包进 worker
- L2 LRU 可放 worker 内，或主线程只收 html 再决策

### 8.6 当前实现（2026-06-18 联调后）

| profile | 编译线程 | 说明 |
|---------|----------|------|
| `edit` | **主线程** | `compileWithRenderCacheAsync` 内 `profile === 'edit'` 时同步 `compileWithRenderCache`；避免 Worker 取消竞态导致管线挂起 |
| `preview` | Worker（demo 注入工厂） | `registerCompileWorkerFactory`；失败回退主线程 |

**MjmlDomRender 触发**：`form.subscribe({ values: true })` → 48ms debounce → `runPipeline`；**不再**由 `blockIndexVersion` 触发（避免与 form 双触发、重复取消编译）。

**富文本冻结**：`shouldPreserveInlineTextDom` 仅在 document 焦点仍在 shadow contenteditable 时为 true；侧栏改属性不冻结。

**Worker 回归 edit 的前置条件**：Worker 侧 job 取消协议（过期 job 不再 postMessage / Promise 可 reject），避免 `cancelPendingCompileJobs` 与队列中旧任务互相阻塞。

**段级 postProcess（已落地）**：`EditCanvasMount` 对 `segment` 模式使用 `postProcessSegmentOuterHtml`，改 1 段背景 postProcess **204ms → ~1.3ms**，端到端 **~360ms → ~159ms**。

**L2 段级直通挂载（已落地 P1a/P1b）**：见 [编辑画布-L2段级直通挂载方案.md](./编辑画布-L2段级直通挂载方案.md)——跳过 `replaceSegmentInHtml` 整页组装，compile 输出 `segmentPatches`，目标改色 **< 50ms**。

---

## 9. 端到端流程（每次如何走）

### 9.1 冷启动打开模板

```
1. EmailEditorProvider：cloneDeep(content) → ensurePageBlockStableIds
2. registry.rebuild(content)
3. MjmlDomRender（`form.subscribe`）：
   4. 主线程 compile（edit）或 Worker（preview）→ fullHtml
   5. buildMountPlan → mode: full（无 prevSnapshot）
   6. postProcessEmailHtml(fullHtml, pageData) → 注入 data-ee-uid
   7. container.innerHTML = mountHtml
   8. prevSnapshot = { segmentUidOrder, hashes }
```

### 9.2 点击选中块

```
1. pointerdown on Shadow DOM
2. blockEl = getBlockNodeByChildEle(target)  // 读 data-ee-uid
3. uid = blockEl.getAttribute('data-ee-uid')
4. idx = registry.uidToIdx(uid)
5. setFocusIdx(idx)
6. FocusBlockLayoutProvider：getBlockNodeByUid(uid) → 边框定位
```

**不经过编译、不经过挂载。**

### 9.3 侧栏改 Section 背景色（属性变更）

```
1. form.change → pageData 更新
2. registry.rebuild(pageData)
3. buildMountPlan：
   - segmentUidOrder 未变
   - 仅该 section 的 uid hash 变
   → mode: segment
4. Worker：L2 命中其他段；仅重编译变更 uid 段
5. postProcessEmailHtml → 从 document 切变更段 outerHTML
6. findElementByStableIdInRoot(container, uid) → morphSegmentOuterHtml
7. 更新 prevSnapshot.hashes[uid]
```

### 9.4 拖拽 move Section（仅顺序变）

```
1. dragEnd → moveBlock(sourceIdx, destIdx) → form 写回 JSON
2. registry.rebuild(newPageData)
3. buildMountPlan：
   - segment uid 集合不变
   - hashes 全同
   - segmentUidOrder 变化
   → mode: reorder
4. ❌ 不调用 Worker
5. ❌ 不 postProcess
6. reorderSegmentDomByUid(container, registry.segmentOrder())
7. （可选）reannotateSubtreeByRegistry
8. 更新 prevSnapshot.segmentUidOrder
```

**主线程总耗时目标 < 20ms。**

### 9.5 末尾新增 Section

```
1. addBlock → pageData 多一个 uid
2. registry.rebuild
3. buildMountPlan → uid 集合变化 → mode: morph-full
4. Worker：compile fullHtml（L2 组装未变段）
5. postProcessEmailHtml → mountHtml
6. morphContainerChildren(container, mountHtml)  // getNodeKey = uid
7. 新段 DOM 插入；旧段按 uid 复用
```

### 9.6 删除中间 Section

```
同 9.5：uid 集合变化 → morph-full + Worker
morphdom 删除多余 uid 节点，保留未删段 DOM
```

### 9.7 富文本画布内打字

```
1. focusin contenteditable
2. shouldPreserveInlineTextDom() === true
3. MjmlDomRender：isCanvasFrozen → 跳过 compile + mount（L3）
4. InlineText 监听 input → form.change（路径来自 data-ee-uid + data-content-field）
5. blur 后：hash 变 → 走 9.3 segment 刷新该段
```

### 9.8 move 的同时改了内容（边界）

```
hashes 有变 + order 变 → morph-full
Worker 全量编译 → morph 按 uid 复用 + patch 新 node-idx class
```

---

## 10. morphdom 与复用（答疑）

### 10.1 uid 不变、node-idx class 变，还能复用 DOM 吗？

| 复用对象 | reorder 零编译 | morph-full（有新 HTML） |
|----------|----------------|-------------------------|
| DOM 节点（同一块） | ✓ 整棵子树搬走 | ✓ uid 匹配后 patch |
| L2 缓存 HTML 字符串 | ✗ 不用 | 未变段可 L2 命中后组装 |
| node-idx class | 暂不复用（可 reannotate） | ✓ morph 更新 class 属性 |

### 10.2 morphdom 配置（保持不变）

```ts
morphdom(live, template, {
  getNodeKey: (node) =>
    node.getAttribute?.('data-ee-uid') ??
    node.getAttribute?.('data-selector'),
  onBeforeElUpdated: (from, to) => {
    if (isFocusedContentEditable(from)) return false;
    // img 等同 src 保留
    return true;
  },
});
```

---

## 11. 实施阶段（PR 拆分）

### PR-1：BlockIndexRegistry（1–2 天）

- [ ] `packages/email-editor-shared/src/blockIndex/`
- [ ] `useBlockIndex` hook
- [ ] 单测：move 后 uidToIdx 正确
- [ ] Feature flag：`EE_UID_REGISTRY=1`（仅打日志，不改交互）

**验收**：控制台 `registry.uidToIdx(uid)` 与 JSON 一致。

### PR-2：交互层切 uid（2–3 天）

- [ ] `useDropBlock` / `getBlockNodeByChildEle` / `getInsertPositionByUid`
- [ ] `RichTextField` + `annotateDocument` data-content-field
- [ ] Focus/Hover tooltip
- [ ] Flag 打开后点击、拖拽正确（**允许**仍全量编译刷新画布）

**验收**：move 后点击、拖拽插入位置正确。

### PR-3：reorder 零编译（1–2 天）

- [ ] `SegmentSnapshot` 改为 uid 键 + segmentUidOrder
- [ ] 恢复 `reorder` mount mode（基于 uid）
- [ ] L2 key 改为 uid+hash；reorder 路径禁用 L2
- [ ] MjmlDomRender：reorder 跳过 compile

**验收**：`[EE-Perf] mount.mode=dom-reorder, pipelineMs<20`。

### PR-4：Worker 编译（2–4 天）

- [x] `compile.worker.ts` + demo `registerCompileWorkerFactory`
- [x] job 取消 + `latestJobId` + `CompileJobCancelled`
- [ ] 属性/增删走 Worker（**edit 暂主线程**，见 §8.6）
- [ ] perf：拖拽过程不丢帧

**验收**：preview Worker 可用；edit 侧栏属性 <100ms 主线程 compile + mount（已验收）。

### PR-5（可选）：reannotateIdx

- [x] reorder 后轻量重写 node-idx / contenteditable idx（`reannotateSubtreeByRegistry`）
- [x] 同父纯 move 不再 `markStructureMutation`，走零编译 + reannotate
- [ ] data-selector 全量重写（非阻塞；交互已优先 uid）

---

## 12. 风险与兜底

| 风险 | 对策 |
|------|------|
| 老模板无 eeUid | `ensurePageBlockStableIds` 加载时补齐 |
| 双轨期 idx/uid 混用 | PR-2 前保留 getBlockNodeByIdx；flag 控制 |
| Worker 与 L2 不一致 | L2 放 worker 内统一管理 |
| morph 失败 | 降级 innerHTML full |
| 回归 | 每 PR 保留 `ee-canvas-debug` / `ee-perf-debug` 用例 |

---

## 13. 性能预期（完成后）

| 场景 | 现状（约） | 目标 |
|------|------------|------|
| move section | 500ms 编译 + 800ms postProcess + 卡 UI | **< 20ms**，UI 不卡 |
| 改 1 段背景 | ~100ms（L2 理想） | 同左；Worker 后主线程 0 编译 |
| 新增 section | ~1.5s | Worker ~500ms + morph ~50ms，拖拽不卡 |
| 打字 | L3 已有 | 保持 |

---

## 14. 调试

```js
localStorage.setItem('ee-canvas-debug', '1');
localStorage.setItem('ee-perf-debug', '1');
// 实施后：
localStorage.setItem('ee-uid-interaction', '1');
```

关注日志：

- `[EE-Canvas:mount.plan]` → mode / reason
- `[EE-Perf] MjmlDomRender.pipeline` → hitLevel / pipelineMs
- `[EE-Perf] MjmlDomRender.mount` → dom-reorder / dom-segment / dom-morph-full

---

## 15. 代码索引（改造时对照）

| 路径 | 说明 |
|------|------|
| `packages/email-editor-shared/src/stableId.ts` | eeUid 工具（已有） |
| `packages/email-editor-editor/src/canvas-mount/buildMountPlan.ts` | Mount 决策 |
| `packages/email-editor-editor/src/canvas-mount/commitMountPlan.ts` | DOM 提交 |
| `packages/email-editor-editor/src/canvas-mount/morphDomOptions.ts` | morphdom key |
| `packages/email-editor-editor/src/render-cache/compilePipeline.ts` | 编译编排 → 接 Worker |
| `packages/email-editor-editor/src/render-cache/segmentAssembly.ts` | L2 组装 |
| `packages/email-editor-editor/src/components/.../MjmlDomRender.tsx` | 管线入口 |
| `packages/email-editor-editor/src/hooks/useDropBlock.ts` | 画布交互 |
| `packages/email-editor-panels/src/form/RichTextField/index.tsx` | 富文本字段绑定 |

---

## 16. 变更记录

| 日期 | 说明 |
|------|------|
| 2026-06-18 | 初版：stableId 交互 + reorder 零编译 + Worker；明确 uid/idx 与 L2 边界 |
| 2026-06-18 | 联调：侧栏属性→画布；edit 编译改主线程；`form.subscribe` 驱动管线；补充 §8.6 |
| 2026-06-18 | 段级 postProcess 落地；新增 [L2 段级直通挂载方案](./编辑画布-L2段级直通挂载方案.md)（目标改色 <50ms） |
