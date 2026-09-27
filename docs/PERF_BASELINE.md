# 邮件编辑器性能基线

> 使用 `ee-perf-debug` 埋点采集数据，填入本文档。改造后使用**相同场景、相同模板、相同浏览器**重测并对比。
> **改造后口径**：`editor.canvasReady` 仅表示 Shadow 空容器挂载，**不代表块可点击**；首屏以 **内容可交互**（`initialRender.totalMs + mount.postProcessMs + mount.commitMs`）为准。

---

## 1. 开启埋点

```js
// 浏览器控制台执行后刷新页面
localStorage.setItem('ee-perf-debug', '1')
```

关闭：

```js
localStorage.setItem('ee-perf-debug', '0')
```

启动 demo：

```bash
pnpm dev
```

控制台过滤关键字：`[EE-Perf]`

查看汇总：

```js
window.__EE_PERF__.dump()   // 表格输出所有埋点记录
window.__EE_PERF__.counters // 计数器，如 formState.change、record.stackPush
```

---

## 2. 测试环境（必填）

| 项目 | 值 |
|------|-----|
| 日期 | |
| 测试人 | |
| Git commit | |
| 浏览器 | 例：Chrome 131 |
| OS | 例：Windows 11 |
| 显示器缩放 | 例：100% |
| demo 启动方式 | `pnpm dev` |
| 埋点开关 | `ee-perf-debug=1` |

---

## 3. 基准模板（带 article_id，可直接打开）

首页进入编辑器 URL 格式：

```
http://localhost:<port>/editor?id=<article_id>&userId=<user_id>
```

### 3.1 推荐三档（性能测试必测）

| 档位 | 模板文件 | article_id | user_id | 标题 | JSON 字符数 | 块数量 | 树深度 | 直接打开 URL |
|------|----------|------------|---------|------|-------------|--------|--------|--------------|
| **S 小** | `Food.json` | **472** | **77** | Welcome to Easy-email | 13,352 | 36 | 4 | `/editor?id=472&userId=77` |
| **M 中** | `Racoon - Ecommerce.json` | **775** | **107** | Racoon - Ecommerce | 24,194 | 80 | 4 | `/editor?id=775&userId=107` |
| **L 大** | `Shop - Newsletter.json` | **817** | **107** | Shop - Newsletter | 66,627 | 92 | 5 | `/editor?id=817&userId=107` |

### 3.2 补充模板（可选扩展测试）

| 模板文件 | article_id | user_id | 标题 | JSON 字符数 | 块数量 | 树深度 | URL |
|----------|------------|---------|------|-------------|--------|--------|-----|
| `Arturia - Newsletter.json` | 802 | 107 | Arturia - Newsletter | 15,293 | — | — | `/editor?id=802&userId=107` |
| `MJML Code - Newsletter.json` | 807 | 107 | MJML Code - Newsletter | 9,879 | — | — | `/editor?id=807&userId=107` |
| `Real Estate.json` | 622 | 77 | Welcome to Easy-email | 26,041 | — | — | `/editor?id=622&userId=77` |
| `Sphero - Newsletter.json` | 815 | 107 | Sphero - Newsletter | 13,341 | — | — | `/editor?id=815&userId=107` |
| `Star Wars.json` | 814 | 107 | Star Wars | 13,184 | — | — | `/editor?id=814&userId=107` |
| `Stay Updated On Our Shopping.json` | 618 | 77 | Welcome to Easy-email | 15,813 | — | — | `/editor?id=618&userId=77` |
| `We Serve Healthy & Delicious Foods.json` | 605 | 77 | Welcome to Easy-email | 21,032 | — | — | `/editor?id=605&userId=77` |

### 3.3 仅文件系统、首页无入口

| 模板文件 | article_id | user_id | 标题 | JSON 字符数 | 块数量 | 树深度 | 说明 |
|----------|------------|---------|------|-------------|--------|--------|------|
| `DynamicData.json` | 834 | 107 | Dynamic rendering | 7,244 | 19 | 6 | 含条件块/迭代块，需手动注入或改路由 |

> 块数量统计方式：解析 `content.content` 内 JSON 后递归计数（含 page 根节点）。

---

## 4. 埋点说明（控制台输出对照表）

| 埋点 tag | step / 字段 | 含义 |
|----------|-------------|------|
| `editor.initialRender` | `totalMs` | 从 `EmailEditorProvider` 挂载到首次 miss 编译完成的墙钟耗时 |
| `editor.initialRender` | `pipelineMs` | 首次 miss 编译耗时（`JsonToMjml + mjmlCompile` + L1/L2 冷启动预热；不含挂载） |
| `editor.canvasReady` | — | Shadow DOM **外层空容器**挂载完成（改造后远早于内容就绪，**勿单独作首屏指标**） |
| `MjmlDomRender.mount` | `postProcessMs` | 编辑画布：`postProcessEmailHtml` 耗时（改造后） |
| `MjmlDomRender.mount` | `commitMs` | 编辑画布：写入 Shadow DOM（`innerHTML` / morph）耗时（改造后） |
| **内容可交互（估算）** | — | `initialRender.totalMs + mount.postProcessMs + mount.commitMs`（改造后首屏主指标） |
| `editor.tabChange` | `from` / `to` / `switchMs` | Tab 切换耗时（双 rAF 后采样） |
| `MjmlDomRender` | `jsonToMjml` | 编辑画布：JSON → MJML 字符串 |
| `MjmlDomRender` | `mjmlCompile` | 编辑画布：MJML → HTML |
| `MjmlDomRender` | `htmlToReact` | 编辑画布：HTML → React 节点树（**改造前**；改造后已移除） |
| `MjmlDomRender` | `cloneDeep.mergeTags` | mergeTags 深拷贝 |
| `MjmlDomRender` | `contentSync.isEqual` | 内容同步时的深度比较 |
| `MjmlDomRender` | `contentSync.cloneDeep` | 内容同步时的深拷贝 |
| `MjmlDomRender.pipeline` | `pipelineMs` | 上述 jsonToMjml + mjmlCompile 合计 |
| `PreviewEmailProvider` | `jsonToMjml` / `mjmlCompile` | 预览管线（**改造前**编辑 Tab 下也会触发；**改造后**编辑 Tab 跳过） |
| `PreviewEmailProvider.pipeline` | `pipelineMs` | 预览管线合计 |
| `RecordProvider` | `isEqual.content` | 撤销栈：内容深度比较 |
| `RecordProvider` | `cloneDeep.values` | 撤销栈：整表快照深拷贝 |
| `useBlock` | `addBlock.cloneDeep` / `addBlock.total` | 添加块 |
| `useBlock` | `moveBlock.cloneDeep` / `moveBlock.total` | 移动块 |
| `useBlock` | `copyBlock.cloneDeep` / `copyBlock.total` | 复制块 |
| `useBlock` | `removeBlock.cloneDeep` / `removeBlock.total` | 删除块 |
| counter | `formState.change` | 表单任意字段变更次数 |
| counter | `record.stackPush` | 撤销栈入栈次数 |

---

## 5. 标准测试场景

每个场景在 **S / M / L 三档模板** 各跑 **3 次取中位数**。

### 5.0 控制台中位数脚本（推荐）

将 [`docs/perf-median-console.js`](./perf-median-console.js) **整段粘贴到控制台**（只需一次），或本地打开该文件复制内容。

**场景 1 示例（L 档 817，跑 3 次）：**

```js
// 每次：硬刷新 → 打开 /editor?id=817&userId=107 → 等画布可点击 → 执行：
eePerf.snap('s1-L-817', 's1')

// 3 次录完后：
eePerf.report('s1-L-817')
// 控制台会输出 table + median 摘要，可直接填入下方表格
```

**场景 2 示例（输入 20 字后）：**

```js
// 每一轮：
eePerf.begin()                    // 清空埋点，只统计本轮操作
// 点击文本块 → 连续输入 20 字
eePerf.snap('s2-M-775', 's2')     // 会打印每次 pipeline 原始 ms 列表

// 硬刷新后重复 3 轮，最后：
eePerf.report('s2-M-775')
// 输出「单轮明细」+「合并统计」；若仅 1 次 pipeline，中位数=最大值属正常（debounce 批量更新）
```

调试当前轮（不 snap）：`eePerf.peek('s2')`

| 命令 | 作用 |
|------|------|
| `eePerf.begin()` | 开始一轮场景（reset 埋点，**场景 2/3/4/5 必用**） |
| `eePerf.peek('s2')` | 查看当前轮原始 pipeline 列表（不调 snap） |
| `eePerf.snap('key', 's1')` | 采集场景 1 冷启动指标 |
| `eePerf.snap('key', 's2')` | 采集场景 2 富文本输入后指标 |
| `eePerf.snap('key', 's3')` | 采集场景 3 属性改色后指标 |
| `await eePerf.snap4After('key', 'addBlock')` | 场景 4：操作后等 1.2s 再采集（**推荐**） |
| `eePerf.snap4('key', 'addBlock')` | 场景 4：立即采集（易漏 pipeline，不推荐） |
| `eePerf.report4('key')` | 场景 4 汇总表（cloneDeep/total 中位数，是否触发 pipeline） |
| `eePerf.begin5()` + `await eePerf.run5('key')` | 场景 5：整轮 Tab 切换（**推荐**，4 阶段自动顺序执行） |
| `await eePerf.phase5('key', 'pcPreview')` | 场景 5：单阶段（先提示切 Tab，再等 3s 采集） |
| `eePerf.verify5()` | 场景 5：检查埋点是否写入（含 `editor.tabChange`） |
| `eePerf.report5('key')` | 场景 5 汇总表（pipeline 次数/ms + Tab 切换耗时） |
| `eePerf.begin6()` + `phase6Start('edit5')` + `await snap6After('key','edit5')` | 场景 6：分阶段采集（**推荐**） |
| `eePerf.report6('key')` | 场景 6 汇总（RecordProvider + Undo/Redo 渲染耗时） |
| `eePerf.snap('key', 's6')` | 场景 6 旧版：整轮一次采集（不推荐，无法区分阶段） |
| `eePerf.report('key')` | 场景 1/2/3 汇总；场景 4/5/6 时等同 `report4` / `report5` / `report6` |
| `eePerf.list()` | 查看已录制的 key 与次数 |
| `eePerf.clear('key')` | 清除某 key 的记录 |
| `eePerf.median([1,2,3])` | 单独算中位数 |

`s2` 说明：富文本聚焦时 `MjmlDomRender.pipeline` 通常为 **0**；`PreviewEmailProvider.pipeline` 会因 debounce（约 300ms）合并多次按键，**往往只有 1～几次**而非 20 次。此时单轮「中位数=最大值」是正常现象。表格填法见 `report()` 末尾 `填入 PERF_BASELINE 场景 2 可参考` 摘要。

### 场景 1：冷启动 / 初始渲染

**操作：**

1. 硬刷新（Ctrl+Shift+R）
2. 直接访问 L 档 URL：`/editor?id=817&userId=107`
3. **保持当前标签页在前台**（后台 tab 会节流 `requestAnimationFrame`，导致 `totalMs` 虚高）
4. 等待画布出现（块可点击）

```js
// 场景 1 推荐采集脚本（改造后含挂载段）
// sessionStart = EmailEditorProvider 挂载那一刻的 performance.now()
const perf = window.__EE_PERF__
const canvas = perf.entries.find(e => e.tag === 'editor.canvasReady')
const initial = perf.entries.find(e => e.tag === 'editor.initialRender')
const mount = perf.entries.filter(e => e.tag === 'MjmlDomRender.mount').pop()
const htmlToReact = perf.entries.find(
  e => e.tag === 'MjmlDomRender' && e.metrics.step === 'htmlToReact',
)

const postProcessMs = mount?.metrics.postProcessMs ?? 0
const commitMs = mount?.metrics.commitMs ?? 0
const contentReadyMs = initial
  ? (initial.metrics.totalMs + postProcessMs + commitMs).toFixed(1)
  : '—'

console.table({
  '编译 pipelineMs': initial?.metrics.pipelineMs,
  '编译 totalMs': initial?.metrics.totalMs,
  '挂载 postProcessMs': mount?.metrics.postProcessMs,
  '挂载 commitMs': mount?.metrics.commitMs,
  '内容可交互 (ms)': contentReadyMs,
  'canvasReady 空壳 (ms)': canvas ? (canvas.time - perf.sessionStart).toFixed(1) : '未触发',
  'htmlToReact (改造前)': htmlToReact?.metrics.durationMs,
  'canvasReady 在 initialRender 之后 (ms)': canvas && initial
    ? (canvas.time - initial.time).toFixed(1)
    : '—',
})

window.__EE_PERF__.dump()
```

```js
// 长任务统计， 跑performance 页面会卡死，先使用脚本观察
window.__LONG_TASKS__ = []
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    window.__LONG_TASKS__.push({
      start: e.startTime,
      duration: e.duration,
      name: e.name,
    })
    if (e.duration > 50) {
      console.warn('[LongTask]', e.duration.toFixed(1) + 'ms', '@', e.startTime.toFixed(1))
    }
  }
}).observe({ type: 'longtask', buffered: true })

// 等画布出现后
const tasks = window.__LONG_TASKS__.filter(t => t.duration > 50)
console.log('Long Task >50ms 数量:', tasks.length)
console.table(tasks)
```

**记录（改造前）：**

| 模板档位 | article_id | `editor.initialRender.totalMs` | `pipelineMs` | `MjmlDomRender.htmlToReact` | `editor.canvasReady` 出现时机 | Long Task >50ms 数量 |
|----------|------------|-------------------------------|--------------|------------------------------|------------------------------|----------------------|
| S (472) | 472| 302.3/330.6/299.1 | 35.6/38.1/59.3 | 1.7/1.8/1.9| 565.6/649.8/684.1 | 0 |
| M (775) |775 |408.9/434.9/433.9 |83.4/84.5/81.2 |3.4/3.5/3.7 |779.7/832.8/806 | 0|
| L (817) | 817| 842.3/830.9/789.7 | 266.4/283.4/266.7 | 5.3/5.3/5.4 | 1411/1523.1/1449.6 | 0 |

**记录（改造后 — canvas-mount 直接 DOM + stableId + L1/L2 缓存，2026-06-24 复测）：**

> L 档当前为 **1 次有效复测**（硬刷新、标签页保持前台）；S/M 待补 3 轮中位数。
> 改造前 `canvasReady` ≈ 内容可交互；改造后 `canvasReady` 为空壳，**内容可交互**列才是与改造前 `canvasReady` 可比的首屏指标。

| 模板档位 | article_id | `initialRender.totalMs` | `pipelineMs` | `mount.postProcessMs` | `mount.commitMs` | **内容可交互** | `canvasReady`（空壳） | Long Task >50ms |
|----------|------------|---------------------------|--------------|----------------------|------------------|----------------|----------------------|-----------------|
| S (472) | 472 | 待测 | 待测 | 待测 | 待测 | 待测 | 待测 | 待测 |
| M (775) | 775 | 待测 | 待测 | 待测 | 待测 | 待测 | 待测 | 待测 |
| L (817) | 817 | **817.2** | **491.6** | **245.5** | **7.6** | **~1070** | **188.2** | 待测 |

**L 档场景 1 改造前后对比（摘要）：**

| 指标 | 改造前（中位数） | 改造后（2026-06-24） | 变化 |
|------|------------------|----------------------|------|
| `pipelineMs` | 266.7 | 491.6 | **+84%**（L1/L2 冷启动预热 + stableId） |
| `initialRender.totalMs` | 830.9 | 817.2 | **−1.6%**（基本持平） |
| `htmlToReact` | 5.3 | —（已移除） | — |
| 挂载段 | React commit ~600ms（隐含） | postProcess 245.5 + commit 7.6 ≈ **253ms** | **约 −58%** |
| 首屏可交互 | `canvasReady` **~1450** | **内容可交互 ~1070** | **约 −26%** |

---

### 场景 2：富文本连续输入（20 字）

**操作：**

1. 打开 M 档 `/editor?id=775&userId=107`
2. 点击任意文本块进入编辑
3. 连续输入 20 个字符
4. 统计控制台 `MjmlDomRender.pipeline` 出现次数

```js
// 过滤 [EE-Perf:MjmlDomRender.pipeline]
const perf = window.__EE_PERF__
const editPipeline = perf.entries.filter(e => e.tag === 'MjmlDomRender.pipeline')
const previewPipeline = perf.entries.filter(e => e.tag === 'PreviewEmailProvider.pipeline')

console.log('MjmlDomRender.pipeline 次数:', editPipeline.length)
console.log('PreviewEmailProvider.pipeline 次数:', previewPipeline.length)
console.log('formState.change:', perf.counters['formState.change'])
console.log('record.stackPush:', perf.counters['record.stackPush'])
```

**记录：**

| 模板档位 | article_id | 管线触发次数 | 单次 `pipelineMs` 中位数 | 单次 `pipelineMs` 最大值 | `formState.change` 计数 | `record.stackPush` 计数 |
|----------|------------|-------------|---------------------------|-------------------------|------------------------|------------------------|
| S (472) | 472|0 |21.8 |39.8 |22 | 20|
| M (775) | 775 |0 |46.4 |93.5 | 22|20 |
| L (817) | 817 |0 |291.4|310.5 |19 |17 |

---

### 场景 3：属性面板修改（改颜色 5 次）

**操作：**

1. 打开 L 档 `/editor?id=817&userId=107`（S/M 档换对应 URL）
2. 选中一个带背景色的 section/column
3. 在右侧属性面板修改背景色 **5 次**

> **顺序**：每轮必须先 **`eePerf.begin()`**（reset 埋点并标记本轮起点），**再**改色 5 次，最后 `snap()`。若跳过 `begin()` 或顺序颠倒，会采到冷启动/上一轮残留，表现为空或异常。

```js
// 每一轮（共 3 轮，每轮硬刷新）：
eePerf.begin()
// 选中 section/column → 属性面板改背景色 5 次（每次换一个颜色）
eePerf.snap('s3-L-817', 's3')

// 3 轮后：
eePerf.report('s3-L-817')
```

**从 report 填表：**

| 表格列 | 看 report 哪里 |
|--------|----------------|
| `MjmlDomRender.pipeline` 触发次数 | 标量表 `editPipelineCount` → **跨轮中位数**（或单轮明细次数） |
| 单次 `pipelineMs` 中位数 | `editPipelineMsList` 单轮明细 → **单轮中位数**；或合并行的「合并中位数」（编辑画布看 edit，不是 preview） |
| `formState.change` | 标量表 `formStateChange` → 跨轮中位数 |
| `PreviewEmailProvider.pipeline` 是否同步触发 | 标量表 `previewSynced` → 任一轮为 true 即「是」；或看 `previewPipelineCount` > 0 |

属性修改会触发 **编辑画布** `MjmlDomRender.pipeline`（与场景 2 不同，场景 2 富文本聚焦时为 0）。改造前 `previewPipelineMsList` 也会同步触发；**改造后**编辑 Tab 下不再同步。

调试：`eePerf.begin()` → 改色 5 次 → `eePerf.peek('s3')`

**记录（改造前）：**

| 模板档位 | article_id | `MjmlDomRender.pipeline` 触发次数 | 单次 `pipelineMs` 中位数 | `formState.change` | `PreviewEmailProvider.pipeline` 是否同步触发 |
|----------|------------|-----------------------------------|-------------------------|-------------------|---------------------------------------------|
| S (472) |472 |5 | 35.1| 37.9|是 |
| M (775) |775 |5 |49.8 |88.2 |是 |
| L (817) |817 |5 |294.4 |389.3 | 是|

**记录（改造后 — L2 段级缓存 + canvas-mount 直接 DOM 挂载，2026-06-24 复测）：**

| 模板档位 | article_id | `MjmlDomRender.pipeline` 触发次数 | 单次 `pipelineMs`（单轮明细 → 中位数） | `formState.change` | `PreviewEmailProvider.pipeline` 是否同步触发 | `cacheHitLevel` | `l2Hits` / `l2Recomputed`（典型） |
|----------|------------|-----------------------------------|----------------------------------------|-------------------|---------------------------------------------|-----------------|-----------------------------------|
| L (817) | 817 | 5 | 30.7 / 20.5 / 15.4 / 17.7 / 19.8 → **19.8** | 6 | **否** | `L2` | ~33 / 1 |

> 上表为 **第 1 轮**（`begin()` → 改色 5 次 → `snap`）；建议再硬刷新补 2 轮后 `report('s3-L-817')` 取跨轮中位数。  
> 改造后编辑 Tab 下 `PreviewEmailProvider.pipeline` 不再同步触发（`previewSynced = false`）。  
> 对比改造前 L 档：294.4 ms → **19.8 ms**（**−93.3%**）。  
> 缓存统计参考：`window.__EE_RENDER_CACHE__.getStats()` — L2 hits 显著增加，misses 接近 0（冷启动除外）。

---

### 场景 4：块操作（各 1 次）

**操作（在 L 档 `/editor?id=817&userId=107`）：**

每种操作前 **`eePerf.begin()`**，操作后 **`await eePerf.snap4After()`**（等渲染链跑完再采），每种操作各跑 **3 轮**（每轮可硬刷新）。

```js
// —— addBlock ×3 轮 ——
eePerf.begin()
// 从左侧拖入 Text 块，等画布更新完
await eePerf.snap4After('s4-L-817', 'addBlock')   // 默认等 1200ms

// —— moveBlock ×3 轮 ——
eePerf.begin()
await eePerf.snap4After('s4-L-817', 'moveBlock')
// 同父 section 纯 reorder：期望 pipeline≈0（reorder + reannotate）；
// 跨父 / 增删仍可能 miss。若文本写错块，检查 mount.reannotate 是否执行。

// —— copyBlock ×3 轮 ——
eePerf.begin()
await eePerf.snap4After('s4-L-817', 'copyBlock')

// —— removeBlock ×3 轮 ——
eePerf.begin()
await eePerf.snap4After('s4-L-817', 'removeBlock')

// 汇总（输出与下方表格对应的行）：
eePerf.report4('s4-L-817')
// 或 eePerf.report('s4-L-817')  // 等价

eePerf.list()  // 查看各操作已录几轮
```

**从 report4 填表：**

`eePerf.report4('s4-L-817')` 末尾会打印 **`填表摘要（中位数）`**，字段与下表一一对应。

| 表格列 | report4 字段 |
|--------|----------------|
| `useBlock.cloneDeep` ms | `useBlock.cloneDeep_中位数` |
| `useBlock.total` ms | `useBlock.total_中位数` |
| `MjmlDomRender.pipeline` ms | `MjmlDomRender.pipeline_中位数`（**体感卡顿主因**） |
| `PreviewEmail.pipeline` ms | `PreviewEmail.pipeline_中位数` |
| `htmlToReact` ms | `htmlToReact_中位数` |
| `RecordProvider.cloneDeep` ms | `RecordProvider.cloneDeep_中位数` |
| 是否触发 pipeline | `是否触发_MjmlDomRender.pipeline` |

`snap4` 的 `op` 可选：`addBlock` | `moveBlock` | `copyBlock` | `removeBlock`

**记录（L 档 817，每种操作 3 轮取中位数）：**

| 操作 | `*.cloneDeep` ms | `*.total` ms | 是否触发 `MjmlDomRender.pipeline` |
|------|------------------|--------------|-----------------------------------|
| addBlock | 1| 0.4| 是|
| moveBlock | 0.9| 0.6|是 |
| copyBlock | 0.7|0.7 | 是|
| removeBlock | 1| 0.6| 是|

| 操作 | useBlock.cloneDeep | useBlock.total | MjmlDomRender.pipeline | PreviewEmail.pipeline | htmlToReact | RecordProvider.cloneDeep | 触发 pipeline |
|------|-------------------|----------------|------------------------|----------------------|-------------|--------------------------|---------------|
| addBlock | 0.9| 0.4|504.7 | 344.5|6.1 |0.8 | 是|
| moveBlock | 1| |0.6 |500.4 | 342| 6.9|0.6 | 是 |
| copyBlock |0.8 |0.9 | 467.3| |323.8 |5.7 | 0.7| 是|
| removeBlock | 0.9| 0.9|477.7 | 305.2|5.4 |0.6 | 是|

---

### 场景 5：Tab 切换（编辑 ↔ 预览）

**操作（在 L 档 `/editor?id=817&userId=107`）：**

整轮只 **`eePerf.begin5()` 一次**，再用 **`await eePerf.run5()`** 或分步 **`phase5()`**；完整流程跑 **3 轮**（每轮硬刷新）。

> **为何 pipeline 全是 0？** 纯 Tab 切换**不会**触发 `PreviewEmailProvider.pipeline` / `MjmlDomRender.pipeline`（仅 `pageData` 变更时触发）。编辑 Tab 空闲 10s 的 preview 次数 **0 是理想值**。`pipelineMs` 无触发时显示 `—` 而非 `null`。切换耗请看 `editor.tabChange.switchMs`（需拉最新代码并硬刷新）。

```js
// —— 一轮（共 3 轮，每轮硬刷新后从头执行）——
eePerf.begin5()
await eePerf.run5('s5-L-817')
// run5 会依次提示：编辑停留 10s → 切 PC → 切移动 → 切回编辑

// 或分步（看到提示后再切 Tab）：
eePerf.begin5()
await eePerf.phase5('s5-L-817', 'editStay')       // 保持编辑 Tab 10s
await eePerf.phase5('s5-L-817', 'pcPreview')      // 提示后立即切 PC 预览，等 3s
await eePerf.phase5('s5-L-817', 'mobilePreview')  // 提示后立即切移动预览，等 3s
await eePerf.phase5('s5-L-817', 'backToEdit')     // 提示后立即切回编辑，等 1s

// 埋点异常时：
eePerf.verify5()   // 切一次 Tab 后应看到 editor.tabChange

// 3 轮后汇总：
eePerf.report5('s5-L-817')
eePerf.list()
```

**从 report5 填表：**

| 表格列 | report5 字段 | 说明 |
|--------|----------------|------|
| `PreviewEmailProvider.pipeline` 次数 | `previewPipelineCount` | 空闲编辑 Tab 理想为 **0** |
| 单次 `pipelineMs` | `previewPipelineMs` | 无触发为 `—` |
| `MjmlDomRender.pipeline` 次数 | `editPipelineCount` | 纯切换理想为 **0** |
| （补充）Tab 切换耗时 | `tabChangeSwitchMs` | 非 pipeline，但可验证切 Tab 有数据 |

`phase5` 的 `phase` 可选：`editStay` | `pcPreview` | `mobilePreview` | `backToEdit`

**可选：测「有编辑后切 Tab 是否多余触发 preview」**

```js
eePerf.begin5()
await eePerf.phase5('s5-L-817', 'editStay', 3000)
// 右侧属性面板改一次背景色，等 1.5s
await eePerf.phase5('s5-L-817', 'pcPreview', 3000)  // 应只有改色时的 pipeline，切 Tab 本身不再追加
```

**操作：**

1. 打开 L 档，停留在 **编辑** Tab 10 秒
2. 切换到 **PC 预览** Tab，等待 3 秒
3. 切换到 **移动预览** Tab，等待 3 秒
4. 切回 **编辑** Tab

**记录：**

| 阶段 | `PreviewEmailProvider.pipeline` 次数 | 单次 `pipelineMs` | tabChangeSwitchMs |
|------|--------------------------------------|-------------------|--------------------------------|
| 编辑 Tab 停留 |0 | -| -|
| 切到 PC 预览 |0 |- | 69.2|
| 切到移动预览 |0 |- |63.4 |
| 切回编辑 |0 | -| 78.2|

---

### 场景 6：撤销 / 重做

**操作（在 L 档 `/editor?id=817&userId=107`）：**

整轮 **`eePerf.begin6()` 一次**，分 3 个阶段手动操作后 **`await snap6After()`**（默认等 1.2s 让渲染链跑完）；完整流程跑 **3 轮**（每轮硬刷新）。

> **要不要加渲染时间？** **要。** Undo/Redo 本身**不会**再跑 `RecordProvider.cloneDeep`（`statusRef` 为 undo/redo 时跳过入栈），用户体感卡顿来自 `form.reset()` 触发的 **`MjmlDomRender.pipeline` + `PreviewEmailProvider.pipeline`**。主表仍填 RecordProvider（编辑阶段）；补充表填 Undo/Redo 渲染耗时。

```js
// —— 一轮（共 3 轮，每轮硬刷新后从头执行）——
eePerf.begin6()

eePerf.phase6Start('edit5')
// 选中 section/column → 右侧属性面板改背景色 5 次
await eePerf.snap6After('s6-L-817', 'edit5')

eePerf.phase6Start('undo3')
// 工具栏撤销 3 次（或 Ctrl+Z ×3）
await eePerf.snap6After('s6-L-817', 'undo3')

eePerf.phase6Start('redo2')
// 工具栏重做 2 次
await eePerf.snap6After('s6-L-817', 'redo2')

// 3 轮后汇总：
eePerf.report6('s6-L-817')
eePerf.list()
```

**从 report6 填表：**

`report6` 会输出两份摘要：

| 表格 | report6 字段 | 对应阶段 |
|------|----------------|----------|
| 主表 `record.stackPush` | `fillTable.record_stackPush` | edit5（≈5 次入栈） |
| 主表 `isEqual.content` ms | `fillTable.isEqual_content_ms` | edit5 |
| 主表 `cloneDeep.values` ms | `fillTable.cloneDeep_values_ms` | edit5 |
| 补充 `MjmlDomRender.pipeline` ms | `renderTable.undo3.mjmlPipeline_ms` / `redo2` | undo3 / redo2 |
| 补充 `PreviewEmail.pipeline` ms | `renderTable.undo3.previewPipeline_ms` / `redo2` | undo3 / redo2 |
| 补充 `htmlToReact` ms | `renderTable.*.htmlToReact_ms` | 可选参考 |

**操作：**

1. 打开 L 档
2. 连续修改属性 5 次
3. 执行 Undo 3 次、Redo 2 次

**记录（主表 — 编辑 5 次阶段，撤销栈成本）：**

| 模板档位 | article_id | 5 次修改后 `record.stackPush` | 单次 `RecordProvider.isEqual.content` 中位数 | 单次 `RecordProvider.cloneDeep.values` 中位数 |
|----------|------------|------------------------------|---------------------------------------------|---------------------------------------------|
| L (817) | 817 |5 | 0.5|0.5 |

**记录（补充 — Undo/Redo 渲染耗时，中位数）：**

| 模板档位 | Undo×3 `MjmlDomRender.pipeline` ms | Undo×3 `PreviewEmail.pipeline` ms | Redo×2 `MjmlDomRender.pipeline` ms | Redo×2 `PreviewEmail.pipeline` ms |
|----------|-----------------------------------|-----------------------------------|-------------------------------------|-------------------------------------|
| L (817) |472.4 | 	304.4| 	459.7| 	289.3|

---

## 6. 基线汇总

### 6.1 改造前

| 指标 | S (472) | M (775) | L (817) | 备注 |
|------|---------|---------|---------|------|
| 初始渲染 `totalMs` | ~302–331 | ~409–435 | ~790–842 | 中位数见场景 1 表 |
| 初始渲染 `pipelineMs` | ~36–59 | ~81–85 | ~266–283 | |
| 初始 `htmlToReact` ms | ~1.7–1.9 | ~3.4–3.7 | ~5.3 | |
| 首屏可交互（`canvasReady`） | ~566–684 | ~780–833 | **~1411–1523** | 改造前与内容就绪大致对齐 |
| 输入 20 字管线触发次数 | 0 | 0 | 0 | L3 冻结 |
| 输入 20 字 `pipelineMs` 中位数 | 21.8 | 46.4 | 291.4 | |
| addBlock `MjmlDomRender.pipeline` ms（L） | — | — | 504.7 | 块操作体感主因 |
| addBlock `PreviewEmail.pipeline` ms（L） | — | — | 344.5 | |
| addBlock `RecordProvider.cloneDeep` ms（L） | — | — | 0.8 | |
| 编辑 Tab 下 preview 管线次数/10s | 0 | 0 | 0 | 场景 5 |
| 属性改色 `pipelineMs` 中位数（L） | — | — | 294.4 | 场景 3 |

### 6.2 改造后（截至 2026-06-24，L 档场景 1 已填）

| 指标 | S (472) | M (775) | L (817) | 备注 |
|------|---------|---------|---------|------|
| 初始渲染 `totalMs` | 待测 | 待测 | **817.2** | |
| 初始渲染 `pipelineMs` | 待测 | 待测 | **491.6** | 含 L1/L2 冷启动预热 |
| `mount.postProcessMs` | 待测 | 待测 | **245.5** | |
| `mount.commitMs` | 待测 | 待测 | **7.6** | |
| **内容可交互** | 待测 | 待测 | **~1070** | 首屏主指标 |
| `canvasReady`（空壳） | 待测 | 待测 | **188.2** | 仅供参考 |
| 属性改色 `pipelineMs` 中位数（L） | — | — | **19.8** | 场景 3，第 1 轮；待 3 轮复核 |
| 属性改色 preview 同步（L） | — | — | **否** | 场景 3 |

---

## 7. 改造后对比

```
提升比例 = (改造前 - 改造后) / 改造前 × 100%
```

| 指标 | 改造前 | 改造后 | 变化 |
|------|--------|--------|------|
| L 档场景 1 **内容可交互** | ~1450（`canvasReady`） | **~1070** | **约 −26%** |
| L 档场景 1 `initialRender.totalMs` | ~831 | **817.2** | **−1.6%** |
| L 档场景 1 `pipelineMs` | ~267 | **491.6** | **+84%**（冷启动缓存预热） |
| L 档场景 1 挂载段 | htmlToReact ~5 + React commit ~600 | postProcess **245.5** + commit **7.6** | **约 −58%** |
| L 档场景 3 改色 `pipelineMs` 中位数 | 294.4 | **19.8** | **−93.3%** |
| L 档场景 3 `cacheHitLevel` | `miss`（全量编译） | `L2`（单段编译） | — |
| L 档输入 20 字 `pipelineMs` 中位数 | 291.4 | 待测 | 待测 |
| M 档 `addBlock.cloneDeep` | 待测 | 待测 | 待测 |
| 编辑 Tab preview 多余触发 | 是（场景 3） | 否 | 已消除双管线 |

---

## 8. 注意事项

1. **关闭无关扩展**：广告拦截、React DevTools 重度 profiling 会影响数值。
2. **每次测试前硬刷新**，避免 HMR 残留状态。
3. **场景 1 测试时保持标签页在前台**；后台 tab 会节流 rAF，导致 `initialRender.totalMs` 虚高（曾出现异常值 ~15960 ms）。
4. **场景 2/3/4 每轮必须先 `eePerf.begin()`**，再操作，最后 `snap()`；顺序错误会导致采集为空或混入冷启动数据。
5. **改造后勿用 `editor.canvasReady` 衡量首屏**；使用「内容可交互」= `totalMs + postProcessMs + commitMs`。
6. `ee-perf-debug` 在 `NODE_ENV=development` 下默认开启；生产构建需显式 `localStorage.setItem('ee-perf-debug','1')`。
7. 埋点仅用于开发/测试，对生产包无性能影响（`isPerfDebugEnabled()` 为 false 时零开销）。
8. 若需导出原始数据：`JSON.stringify(window.__EE_PERF__.entries, null, 2)` 保存为附件。

---

## 9. 相关代码

| 文件 | 说明 |
|------|------|
| `packages/email-editor-shared/src/debug/perfDebug.ts` | 埋点工具 |
| `packages/email-editor-editor/.../MjmlDomRender.tsx` | 编辑画布管线 |
| `packages/email-editor-editor/.../PreviewEmailProvider/index.tsx` | 预览管线 |
| `packages/email-editor-editor/.../RecordProvider/index.tsx` | 撤销栈 |
| `packages/email-editor-editor/src/hooks/useBlock.ts` | 块操作 |
| `packages/email-editor-editor/.../EmailEditorProvider/index.tsx` | 会话计时起点 |
| `packages/email-editor-editor/src/render-cache/三级缓存说明.md` | L1/L2/L3 缓存设计与实测 |
| `packages/email-editor-editor/src/canvas-mount/画布挂载说明.md` | 段级 DOM 挂载（M1） |
