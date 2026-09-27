# Email Editor 优化方案

## 目录

- [Email Editor 优化方案](#email-editor-优化方案)
  - [目录](#目录)
  - [一、交互优化](#一交互优化)
    - [1.1 RichTextToolBar 位置优化](#11-richtexttoolbar-位置优化)
      - [当前问题](#当前问题)
      - [建议方案：浮动工具栏（Floating Toolbar）](#建议方案浮动工具栏floating-toolbar)
      - [实现要点](#实现要点)
    - [1.2 富文本属性回显优化](#12-富文本属性回显优化)
      - [当前问题](#当前问题-1)
      - [建议方案](#建议方案)
    - [1.3 其他交互改进](#13-其他交互改进)
      - [1.3.1 拖拽体验优化](#131-拖拽体验优化)
      - [1.3.2 快捷键支持](#132-快捷键支持)
      - [1.3.3 空状态引导](#133-空状态引导)
  - [二、布局重构：配置面板左移 + AI 面板右置](#二布局重构配置面板左移--ai-面板右置)
    - [2.1 整体布局方案](#21-整体布局方案)
    - [2.2 具体实现思路](#22-具体实现思路)
      - [2.2.1 修改 StandardLayout](#221-修改-standardlayout)
      - [2.2.2 修改 EditPanel — 支持覆盖式配置](#222-修改-editpanel--支持覆盖式配置)
      - [2.2.3 返回按钮交互](#223-返回按钮交互)
      - [2.2.4 编辑器失焦处理](#224-编辑器失焦处理)
    - [2.3 交互流程](#23-交互流程)
    - [2.4 AI 面板集成建议](#24-ai-面板集成建议)
  - [三、性能优化](#三性能优化)
    - [3.1 Context 交叉重渲染问题（高优先级）](#31-context-交叉重渲染问题高优先级)
      - [问题澄清](#问题澄清)
      - [真正的问题：同一 Context 内的交叉重渲染](#真正的问题同一-context-内的交叉重渲染)
      - [解决方案](#解决方案)
    - [3.2 ExtensionProvider 缓存 Bug 修复](#32-extensionprovider-缓存-bug-修复)
      - [问题](#问题)
      - [修复方案](#修复方案)
    - [3.3 RecordProvider Bug 修复](#33-recordprovider-bug-修复)
      - [问题](#问题-1)
      - [修复方案](#修复方案-1)
    - [3.4 PropsProvider 依赖优化](#34-propsprovider-依赖优化)
      - [问题](#问题-2)
      - [修复方案](#修复方案-2)
    - [3.5 组件 Memoization](#35-组件-memoization)
      - [建议 Memo 的组件](#建议-memo-的组件)
    - [3.6 enhancer 中 Hooks 规则问题](#36-enhancer-中-hooks-规则问题)
      - [问题](#问题-3)
      - [修复方案](#修复方案-3)
  - [四、代码结构优化](#四代码结构优化)
    - [4.1 重复代码消除](#41-重复代码消除)
      - [Stack 组件重复](#stack-组件重复)
      - [HTML 转 React 节点](#html-转-react-节点)
      - [AIGenerate 中的重复 hooks](#aigenerate-中的重复-hooks)
    - [4.2 Context 拆分与粒度优化](#42-context-拆分与粒度优化)
      - [问题](#问题-4)
      - [建议](#建议)
    - [4.3 导入路径规范化](#43-导入路径规范化)
    - [4.4 配置与常量整理](#44-配置与常量整理)
  - [五、Zustand 替换 Context 可行性分析](#五zustand-替换-context-可行性分析)
    - [5.1 现状：Context 全景图](#51-现状context-全景图)
      - [email-editor-editor（7 个）](#email-editor-editor7-个)
      - [email-editor-extensions（3 个）](#email-editor-extensions3-个)
      - [Provider 嵌套顺序（EmailEditorProvider 内部）](#provider-嵌套顺序emaileditorprovider-内部)
    - [5.2 核心问题：为什么 Context 不够好](#52-核心问题为什么-context-不够好)
      - [问题 1：无法按需订阅（最大痛点）](#问题-1无法按需订阅最大痛点)
      - [问题 2：value 对象重建（影响有限，已修正）](#问题-2value-对象重建影响有限已修正)
      - [问题 3：跨 Context 的复合订阅](#问题-3跨-context-的复合订阅)
    - [5.3 Zustand 的收益分析](#53-zustand-的收益分析)
      - [收益 1：Selector 精确订阅（最大收益）](#收益-1selector-精确订阅最大收益)
      - [收益 2：无需 useMemo 包装 Provider 值](#收益-2无需-usememo-包装-provider-值)
      - [收益 3：简化 Provider 嵌套](#收益-3简化-provider-嵌套)
      - [收益 4：DevTools 支持](#收益-4devtools-支持)
      - [收益 5：外部访问 Store](#收益-5外部访问-store)
    - [5.4 Zustand 迁移的架构约束与风险](#54-zustand-迁移的架构约束与风险)
      - [约束 1：多实例隔离](#约束-1多实例隔离)
      - [约束 2：react-final-form 的耦合](#约束-2react-final-form-的耦合)
      - [约束 3：公共 API 兼容](#约束-3公共-api-兼容)
      - [约束 4：EventManager 与 setActiveTab 的交互](#约束-4eventmanager-与-setactivetab-的交互)
    - [5.5 推荐方案：渐进式混合迁移](#55-推荐方案渐进式混合迁移)
      - [阶段 1：迁移 BlocksContext → Zustand（收益最大）](#阶段-1迁移-blockscontext--zustand收益最大)
      - [阶段 2：迁移 HoverIdxContext → Zustand](#阶段-2迁移-hoveridxcontext--zustand)
      - [阶段 3：优化 EditorPropsContext（可选）](#阶段-3优化-editorpropscontext可选)
    - [5.6 具体迁移实现](#56-具体迁移实现)
      - [步骤清单](#步骤清单)
      - [EmailEditorProvider 改造后](#emaileditorprovider-改造后)
    - [5.7 不建议迁移的 Context](#57-不建议迁移的-context)
    - [5.8 迁移优先级与工作量估算](#58-迁移优先级与工作量估算)
    - [5.9 结论](#59-结论)
  - [六、优先级排序](#六优先级排序)
    - [P0 — 立即修复（Bug + 低成本改善）](#p0--立即修复bug--低成本改善)
    - [P1 — 短期优化（1-2 周）](#p1--短期优化1-2-周)
    - [P2 — 中期重构（2-4 周）](#p2--中期重构2-4-周)
    - [P3 — 长期优化（按需）](#p3--长期优化按需)

---

## 一、交互优化

### 1.1 RichTextToolBar 位置优化

#### 当前问题

当前 `RichTextToolBar` 使用 `position: absolute; top: 0` 固定在编辑器画布的顶部，存在以下问题：

1. **距离编辑位置太远**：用户在编辑底部内容时，需要将鼠标移动很长距离才能操作工具栏
2. **宽度撑满编辑器**：工具栏占据了 `calc(100% - 16px)` 的宽度，视觉上过于霸占空间
3. **遮挡内容**：`SyncScrollShadowDom` 为此预留了 `offsetTop: 50` 的空间，减少了可编辑区域

#### 建议方案：浮动工具栏（Floating Toolbar）

将工具栏改为跟随选中文本/光标位置的浮动方式，类似 Notion、语雀等现代编辑器的交互：

```
当前方案:
┌──────────────────────────────────────┐
│ [B] [I] [U] [FontSize] [Color] ...  │  ← 固定顶部，远离编辑位置
├──────────────────────────────────────┤
│                                      │
│     这里是正在编辑的文字内容          │  ← 用户在此处编辑
│                                      │
└──────────────────────────────────────┘

优化方案:
┌──────────────────────────────────────┐
│                                      │
│     这里是正在编辑的 [选中文字] 内容  │
│              ┌─────────────────┐     │
│              │ B I U Aa 🎨 ... │     │  ← 浮动在选区附近
│              └─────────────────┘     │
│                                      │
└──────────────────────────────────────┘
```

#### 实现要点

**文件**：`packages/email-editor-extensions/src/components/Form/RichTextToolBar/RichTextToolBar.tsx`

1. **获取选区位置**：通过 `selectionRange.getBoundingClientRect()` 获取当前选中文本的位置
2. **动态计算工具栏位置**：工具栏出现在选区的上方或下方（根据可用空间自动判断）
3. **自适应宽度**：工具栏宽度由内容撑开（`width: auto`），不再强制撑满
4. **边界检测**：确保工具栏不超出编辑器可视区域

```tsx
// 核心思路（伪代码）
const toolbarPosition = useMemo(() => {
  if (!selectionRange) return null;

  const rect = selectionRange.getBoundingClientRect();
  const editorRect = editorContainer.getBoundingClientRect();

  // 默认在选区上方
  let top = rect.top - editorRect.top - TOOLBAR_HEIGHT - GAP;
  let left = rect.left - editorRect.left;

  // 如果上方空间不足，移到下方
  if (top < 0) {
    top = rect.bottom - editorRect.top + GAP;
  }

  // 水平边界检测
  left = Math.max(0, Math.min(left, editorRect.width - TOOLBAR_WIDTH));

  return { top, left };
}, [selectionRange]);
```

5. **过渡动画**：添加淡入/滑动动画让工具栏出现更自然
6. **移除 `SyncScrollShadowDom` 的 `offsetTop` 预留空间**，回收被工具栏占据的画布区域

---

### 1.2 富文本属性回显优化

#### 当前问题

当前 `FontSize` 和 `FontFamily` 组件只显示图标，用户无法直观看到当前选中文字的字号和字体。

#### 建议方案

**文件**：
- `packages/email-editor-extensions/src/components/Form/RichTextToolBar/components/FontSize/index.tsx`
- `packages/email-editor-extensions/src/components/Form/RichTextToolBar/components/FontFamily/index.tsx`

1. **FontSize 回显当前字号**

```tsx
// 读取当前选区的 fontSize
const currentFontSize = useMemo(() => {
  if (!selectionRange) return '';
  const element = selectionRange.commonAncestorContainer.parentElement;
  if (element) {
    return window.getComputedStyle(element).fontSize;
  }
  return '';
}, [selectionRange]);

// 在 ToolItem 中显示当前值
<ToolItem
  title={t('Font size')}
  icon={<span style={{ fontSize: 12, minWidth: 32 }}>{currentFontSize || 'Aa'}</span>}
/>
```

2. **FontFamily 回显当前字体**

```tsx
const currentFontFamily = useMemo(() => {
  if (!selectionRange) return '';
  const element = selectionRange.commonAncestorContainer.parentElement;
  if (element) {
    const family = window.getComputedStyle(element).fontFamily;
    return family.split(',')[0].replace(/['"]/g, '').trim();
  }
  return '';
}, [selectionRange]);

// 显示截断的字体名
<ToolItem
  title={t('Font family')}
  icon={
    <span style={{ fontSize: 11, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {currentFontFamily || 'Font'}
    </span>
  }
/>
```

3. **粗体/斜体/下划线等状态高亮**

当前的 `Bold`、`Italic`、`Underline` 等工具已经接收 `currentRange` 但没有做激活状态回显。建议：

```tsx
// Bold 组件示例
const isActive = useMemo(() => {
  return document.queryCommandState('bold');
}, [selectionRange]);

<ToolItem
  className={isActive ? 'tool-active' : ''}
  // ...
/>
```

配合 CSS:
```css
.tool-active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
```

---

### 1.3 其他交互改进

#### 1.3.1 拖拽体验优化

当前拖拽组件块时，放置目标的指示不够明显。建议：
- 增加拖拽时的半透明预览（ghost element）
- 放置区域使用更明显的蓝色边框/背景高亮
- 添加拖拽动画过渡

#### 1.3.2 快捷键支持

- 撤销/重做：确保 `Ctrl+Z` / `Ctrl+Shift+Z` 在所有状态下正常工作
- 复制/粘贴块：支持 `Ctrl+C` / `Ctrl+V` 复制整个组件块
- 删除块：选中块后按 `Delete` 键删除
- 快速保存：`Ctrl+S`

#### 1.3.3 空状态引导

当编辑器内容为空时，展示明确的引导提示（如"拖拽组件到此处开始设计"），降低学习成本。

---

## 二、布局重构：配置面板左移 + AI 面板右置

### 2.1 整体布局方案

将当前的三栏布局从 `[左: 组件+层级] [中: 编辑器] [右: 配置+源码]` 重构为：

```
┌─────────────────────────────────────────────────────────────┐
│                       Header / Toolbar                       │
├──────────┬──────────────────────────────┬────────────────────┤
│          │                              │                    │
│  左侧栏   │       中间编辑器画布          │    右侧 AI 面板    │
│          │                              │                    │
│ ┌──────┐ │                              │  ┌──────────────┐  │
│ │ 组件  │ │                              │  │  AI 对话界面  │  │
│ │ 列表  │ │                              │  │              │  │
│ │      │ │                              │  │  消息流       │  │
│ │ 层级  │ │                              │  │              │  │
│ │ 树   │ │                              │  │  输入框       │  │
│ └──────┘ │                              │  └──────────────┘  │
│          │                              │                    │
│          │                              │                    │
├──────────┤                              │                    │
│ 配置覆盖  │                              │                    │
│ (选中时)  │                              │                    │
│          │                              │                    │
│ [← 返回] │                              │                    │
│ 配置     │                              │                    │
│ 源码     │                              │                    │
└──────────┴──────────────────────────────┴────────────────────┘
```

### 2.2 具体实现思路

#### 2.2.1 修改 StandardLayout

**文件**：`packages/email-editor-extensions/src/StandardLayout/StandardLayout.tsx`

将右侧 `ConfigurationPanel` 移除，改为在左侧 `EditPanel` 内部做覆盖式渲染。

```tsx
// 修改后的 StandardLayout 布局
<Layout style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
  {/* 左侧：组件面板 + 覆盖式配置面板 */}
  <EditPanel
    showSourceCode={showSourceCode}
    jsonReadOnly={jsonReadOnly}
    mjmlReadOnly={mjmlReadOnly}
    configMode="overlay"  // 新增：覆盖模式
  />

  {/* 中间：编辑器 */}
  <Layout style={{ height: containerHeight, flex: 1 }}>
    {props.children}
  </Layout>

  {/* 右侧：预留给 AI（由 demo/业务层通过 props.children 或 slot 传入） */}
  {props.rightPanel && (
    <Layout.Sider style={{ height: containerHeight, minWidth: 400, maxWidth: 500 }}>
      {props.rightPanel}
    </Layout.Sider>
  )}
</Layout>
```

#### 2.2.2 修改 EditPanel — 支持覆盖式配置

**文件**：`packages/email-editor-extensions/src/EditPanel/index.tsx`

```tsx
export function EditPanel({ showSourceCode, jsonReadOnly, mjmlReadOnly, configMode }) {
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const showConfig = configMode === 'overlay' && !!focusIdx && focusIdx !== getPageIdx();

  const handleBack = useCallback(() => {
    setFocusIdx('');  // 清除焦点 → 编辑器失焦 → 配置面板消失
  }, [setFocusIdx]);

  return (
    <Layout.Sider style={{ position: 'relative', minWidth: 360 }}>
      {/* 默认内容：组件 + 层级 */}
      <Tabs defaultActiveTab="2">
        <TabPane key="2" title={t('Block')}>
          <Blocks />
        </TabPane>
        <TabPane key="1" title={t('Layer')}>
          <BlockLayer />
        </TabPane>
      </Tabs>

      {/* 选中节点时：配置面板覆盖整个左侧栏 */}
      {showConfig && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10,
          backgroundColor: '#fff',
        }}>
          <ConfigurationPanel
            height={height}
            showSourceCode={showSourceCode}
            jsonReadOnly={jsonReadOnly}
            mjmlReadOnly={mjmlReadOnly}
            compact={false}
            onBack={handleBack}
          />
        </div>
      )}
    </Layout.Sider>
  );
}
```

#### 2.2.3 返回按钮交互

**文件**：`packages/email-editor-extensions/src/ConfigurationPanel/index.tsx`

`ConfigurationPanel` 已有 `onBack` props 和返回按钮的渲染逻辑（在 `!compact` 模式下）。需要确保：

1. 点击返回按钮时调用 `onBack` → `setFocusIdx('')`
2. `focusIdx` 清空后，编辑器失焦（不再有高亮选中的块）
3. 配置面板因为 `showConfig` 变为 `false` 而消失
4. 左侧栏恢复显示组件列表和层级树

#### 2.2.4 编辑器失焦处理

当 `setFocusIdx('')` 被调用时，需要确保：

```tsx
// 在 useDropBlock 或相关 hook 中
useEffect(() => {
  if (!focusIdx || focusIdx === getPageIdx()) {
    // 移除画布中的选中高亮
    // 确保 RichTextField 也被关闭
  }
}, [focusIdx]);
```

### 2.3 交互流程

```
状态1: 初始状态
┌──────────┬──────────────────────┬──────────────┐
│ 组件列表  │                      │              │
│ 层级树    │     编辑器画布        │   AI 面板    │
│          │                      │              │
└──────────┴──────────────────────┴──────────────┘

                    ↓ 用户点击某个块

状态2: 选中节点（配置面板覆盖左侧栏）
┌──────────┬──────────────────────┬──────────────┐
│ [← 返回]  │                      │              │
│ 配置      │     编辑器画布        │   AI 面板    │
│ 属性表单  │  (被点击的块高亮)     │              │
│ 源码      │                      │              │
└──────────┴──────────────────────┴──────────────┘

                    ↓ 用户点击「返回」

状态3: 回到初始状态（编辑器失焦）
┌──────────┬──────────────────────┬──────────────┐
│ 组件列表  │                      │              │
│ 层级树    │     编辑器画布        │   AI 面板    │
│          │  (无高亮选中)         │              │
└──────────┴──────────────────────┴──────────────┘
```

### 2.4 AI 面板集成建议

**文件**：`demo/src/components/AIGenerate/index.tsx`

当前 AI 面板是一个 Drawer（抽屉），建议改为固定在右侧的面板：

```tsx
// 从 Drawer 改为固定面板
// 之前：
<Drawer visible={visible} width={640} placement="right" ...>
  {/* AI 聊天内容 */}
</Drawer>

// 之后：
<div style={{
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: '1px solid var(--color-border)',
}}>
  {/* AI 聊天内容（不再是 Drawer，而是内嵌面板） */}
  <div style={{ flex: 1, overflow: 'auto' }}>
    <MessageList ... />
  </div>
  <ChatInput ... />
</div>
```

好处：
- AI 面板始终可见，用户可以同时观察编辑器内容和 AI 输出
- 减少了 Drawer 的打开/关闭操作，操作更流畅
- AI 生成结果可以实时预览在编辑器中，无需切换视图

---

## 三、性能优化

### 3.1 Context 交叉重渲染问题（高优先级）

#### 问题澄清

~~`BlocksProvider` 和 `HoverIdxProvider` 在每次渲染时都创建新的 `value` 对象，导致所有消费者不必要地重新渲染。~~

**修正**：Context Provider 的 value 未 useMemo 的影响 **比最初描述的要小**。原因：

1. **Provider 自身只在内部 `useState` 变化时重渲染**，不会因为父级重渲染而触发（因为 children 是通过 `{props.children}` 传入的，React 复用了 element 引用）。
2. **Context 值变化只影响实际的消费者**（调用了 `useContext(SomeContext)` 的组件），不会像 props 那样级联到整个子树。
3. 例如 `HoverIdxProvider` 的 `hoverIdx` 变化不会导致 `FormWrapper` 重渲染，因为 `FormWrapper` 不是 `HoverIdxContext` 的消费者。

#### 真正的问题：同一 Context 内的交叉重渲染

核心痛点不是"value 对象引用不稳定"，而是 **一个 Context 内捆绑了多个不相关的状态，导致只关心其中一个字段的消费者在其他字段变化时也被重渲染**。

**典型案例：`BlocksContext`**

```
BlocksContext = {
  focusIdx,        ← useFocusIdx() 只需要这个
  activeTab,       ← useActiveTab() 只需要这个
  dragEnabled,     ← useDraggable() 只需要这个
  initialized,     ← useEditorContext() 只需要这个
  collapsed,       ← 没有任何消费者使用（死代码）
}
```

当 `focusIdx` 变化时（用户点击不同的块），以下组件会重渲染：
- ✅ 所有调用 `useFocusIdx()` 的组件 — 合理
- ❌ 所有调用 `useActiveTab()` 的组件 — 不必要
- ❌ 所有调用 `useEditorContext()` 的组件 — 不必要（只关心 initialized）

同理 `HoverIdxContext` 中，`hoverIdx` 高频变化时，只关心 `dataTransfer` 的消费者也会被触发。

#### 解决方案

这个问题 **useMemo 无法解决**（因为 value 确实变了，只是消费者不关心变的那部分）。

正确的解决方案是：
1. **Zustand + selector**（推荐，见第五章）：`useEditorStore(s => s.focusIdx)` 只在 focusIdx 实际变化时重渲染
2. **拆分为多个 Context**：`FocusContext`、`TabContext`、`DragContext` 各自独立

> **补充**：对于 `ScrollProvider`，其 value 仅包含两个 ref（引用稳定），加 `useMemo` 确实有意义——防止父级重渲染时创建新的包装对象。这是一个低成本修复。

---

### 3.2 ExtensionProvider 缓存 Bug 修复

#### 问题

**文件**：`packages/email-editor-extensions/src/components/Providers/ExtensionProvider.tsx`

```tsx
const cacheValue = useMemo(() => {
  if (!isEqual(value, valueRef)) {       // ❌ 比较 value 与 ref 对象本身
    valueRef.current = value;
  }
  return valueRef.current;
}, [value, valueRef]);
```

这里 `isEqual(value, valueRef)` 将 props 对象与 **ref 对象本身**（`{ current: ... }`）比较，而非 `valueRef.current`，导致永远不相等，缓存失效。

#### 修复方案

```tsx
const cacheValue = useMemo(() => {
  if (!isEqual(value, valueRef.current)) {  // ✅ 与 .current 比较
    valueRef.current = value;
  }
  return valueRef.current;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);  // valueRef 是 ref，不需要作为依赖
```

---

### 3.3 RecordProvider Bug 修复

#### 问题

**文件**：`packages/email-editor-editor/src/components/Provider/RecordProvider/index.tsx`

```tsx
const isChanged = !(
  currentItem &&
  isEqual(formState.values.content, currentItem.content) &&
  formState.values.subTitle === currentItem.subTitle &&
  formState.values.subTitle === currentItem.subTitle  // ❌ subTitle 重复比较
);
```

`subTitle` 被比较了两次，而 `subject` 从未被比较。这意味着 `subject` 的变更不会被撤销/重做系统记录。

#### 修复方案

```tsx
const isChanged = !(
  currentItem &&
  isEqual(formState.values.content, currentItem.content) &&
  formState.values.subTitle === currentItem.subTitle &&
  formState.values.subject === currentItem.subject  // ✅ 修复为 subject
);
```

---

### 3.4 PropsProvider 依赖优化

#### 问题

**文件**：`packages/email-editor-editor/src/components/Provider/PropsProvider/index.tsx`

```tsx
const formatProps = useMemo(() => {
  return {
    ...props,
    mergeTagGenerate,
    dashed,
  };
}, [mergeTagGenerate, props, dashed]);  // ❌ props 对象每次渲染都是新引用
```

`props` 整体作为 `useMemo` 的依赖，但父组件每次渲染都会创建新的 `props` 对象引用，导致 memo 缓存无效。

#### 修复方案

将 `props` 展开为具体的稳定属性作为依赖：

```tsx
const {
  dashed = true,
  mergeTagGenerate = defaultMergeTagGenerate,
  height,
  fontList,
  onUploadImage,
  onSubmit,
  // ... 列出所有需要的属性
} = props;

const formatProps = useMemo(() => ({
  dashed,
  mergeTagGenerate,
  height,
  fontList,
  onUploadImage,
  onSubmit,
  // ...
}), [dashed, mergeTagGenerate, height, fontList, onUploadImage, onSubmit]);
```

或者使用深度比较：

```tsx
import { useDeepCompareMemo } from 'use-deep-compare';

const formatProps = useDeepCompareMemo(() => ({
  ...props,
  mergeTagGenerate,
  dashed,
}), [props]);
```

---

### 3.5 组件 Memoization

#### 建议 Memo 的组件

以下组件渲染频率高或子树复杂，建议用 `React.memo` 包装：

| 组件 | 位置 | 原因 |
|------|------|------|
| `EditEmailPreview` | email-editor-editor | 包含整个邮件画布 + Shadow DOM，任何 context 变化都触发重渲染 |
| `AttributePanel` | email-editor-extensions | 包含大量表单字段，`focusIdx` 变化时按 key 重建即可 |
| `BlockLayer` | email-editor-extensions | 层级树在编辑操作时频繁更新 |
| `Tools` (RichTextToolBar) | email-editor-extensions | 工具栏每次选区变化都重建 |
| `ConfigurationPanel` | email-editor-extensions | 配置面板不应因无关状态变化而重渲染 |

---

### 3.6 enhancer 中 Hooks 规则问题

#### 问题

`packages/email-editor-extensions/src/components/Form/enhancer.tsx` 中，在 `Field` 的 render prop 内部使用了 `useCallback`、`useEffect` 等 hooks。这违反了 React Hooks 规则（hooks 只能在组件或自定义 hook 中调用），虽然在 react-final-form 中通常能正常工作，但：

- ESLint 无法正确检查依赖
- 存在潜在的闭包过期问题
- 维护困难

#### 修复方案

将 `Field` render prop 内部的逻辑提取为独立的子组件：

```tsx
// 之前
<Field name={name}>
  {({ input }) => {
    const handleChange = useCallback(...);  // ❌ hooks in render prop
    useEffect(...);
    return <Component ... />;
  }}
</Field>

// 之后
function FieldInner({ input, ...rest }) {
  const handleChange = useCallback(...);  // ✅ hooks in component
  useEffect(...);
  return <Component ... />;
}

<Field name={name}>
  {({ input }) => <FieldInner input={input} {...rest} />}
</Field>
```

---

## 四、代码结构优化

### 4.1 重复代码消除

#### Stack 组件重复

- `demo/src/components/Stack` 和 `packages/email-editor-editor/src/components/UI/Stack` 是相同的 Polaris Stack 实现
- **建议**：demo 应直接从 `@wa-dev/email-editor-editor` 导入，删除 demo 中的副本

#### HTML 转 React 节点

- `HtmlStringToReactNodes.tsx` 和 `HtmlStringToPreviewReactNodes.tsx` 有大量相似逻辑
- **建议**：提取公共的解析逻辑为共享工具函数，两个文件只保留差异部分

#### AIGenerate 中的重复 hooks

- `demo/src/components/AIGenerate/hooks/` 和 `demo/src/components/AIGenerate/SideIndicator/hooks/` 有重复的 `useVirtualList`、`useScrollSync`、`useOptimizedHover`
- **建议**：合并到单一 hooks 目录

---

### 4.2 Context 拆分与粒度优化

#### 问题

`BlocksContext` 承载了太多职责（focusIdx、dragEnabled、initialized、collapsed、activeTab），任何一个值的变化都会导致所有消费者重渲染。

#### 建议

将高频变化和低频变化的状态拆分到不同的 Context：

```tsx
// 高频：焦点相关
const FocusContext = React.createContext({ focusIdx, setFocusIdx });

// 高频：拖拽相关
const DragContext = React.createContext({ dragEnabled, setDragEnabled });

// 低频：编辑器状态
const EditorStateContext = React.createContext({
  initialized, setInitialized,
  collapsed, setCollapsed,
  activeTab, setActiveTab,
});
```

同理，`HoverIdxContext` 可以将 `dataTransfer`（拖拽时才用）与 `hoverIdx`（鼠标移动就变）拆分。

> **注意**：这是一个较大的重构，建议在性能分析（React DevTools Profiler）确认瓶颈后再做。

---

### 4.3 导入路径规范化

目前存在路径别名混用的情况：

```tsx
// 有些用 @extensions/...
import { AttributePanel } from '@extensions/AttributePanel';

// 有些用相对路径
import { ConfigurationDrawer } from './ConfigurationDrawer';
```

建议统一规则：
- 跨目录引用一律使用 `@extensions/...` / `@/...` 路径别名
- 同目录内子模块使用相对路径 `./`

---

### 4.4 配置与常量整理

**文件**：`packages/email-editor-editor/src/constants.ts`

- 常量命名规范不一致：`EASY_EMAIL_EDITOR_ID` vs `RICH_TEXT_BAR_ID`（有些带 `EASY_EMAIL` 前缀，有些不带）
- Class name 和 ID 混用 `easy-email-` 和 `wa-email-` 前缀
- 建议统一前缀为 `wa-email-editor-` 并逐步迁移

---

## 五、Zustand 替换 Context 可行性分析

### 5.1 现状：Context 全景图

项目中共有 **10 个 React Context**，分布在三个包中：

#### email-editor-editor（7 个）

| Context | 数据内容 | 变化频率 | 值是否 Memo | 消费者数量 |
|---------|---------|---------|------------|-----------|
| `BlocksContext` | focusIdx, activeTab, dragEnabled, collapsed, initialized + 所有 setter | **高** | **否** ❌ | 5 个 hook（useFocusIdx, useActiveTab, useEditorContext, useDragable, useBlock） |
| `HoverIdxContext` | hoverIdx, isDragging, direction, dataTransfer + 所有 setter | **高** | **否** ❌ | 2 个 hook（useHoverIdx, useDataTransfer） |
| `EditorPropsContext` | 编辑器全量配置 props（height, fontList, toolbar, onUploadImage 等 20+ 字段） | **低** | 是（但 deps 有 `props` 整体引用问题） |多处 useEditorProps() |
| `RecordContext` | records, undo, redo, undoable, redoable, reset | **中** | 是 | 1 个 hook（useBlock 中 useContext） |
| `PreviewEmailContext` | html, reactNode, errMsg, mobileWidth | **高** | 是 | 1 个 hook（usePreviewEmail） |
| `ScrollContext` | scrollHeight ref, viewElementRef ref | **低**（ref 稳定，但包装对象每次渲染新建） | **否** ❌ | 1 个 hook（useDomScrollHeight） |
| `FocusBlockLayoutContext` | focusBlockNode (DOM 节点) | **中** | 是 | 1 个 hook（useFocusBlockLayout） |

#### email-editor-extensions（3 个）

| Context | 数据内容 | 变化频率 | 值是否 Memo | 消费者数量 |
|---------|---------|---------|------------|-----------|
| `ExtensionContext` | categories, compact, showSourceCode 等扩展配置 | **低** | 是（但有 Bug：`isEqual(value, valueRef)` 应为 `valueRef.current`） | 1 个 hook（useExtensionProps） |
| `SelectionRangeContext` | selectionRange, setSelectionRange | **高** | 是 | 1 个 hook（useSelectionRange） |
| `PresetColorsContext` | colors[], addCurrentColor | **低** | 是 | 直接 useContext 于 ColorPicker 组件 |

#### Provider 嵌套顺序（EmailEditorProvider 内部）

```
Form (react-final-form)
  └─ PropsProvider (EditorPropsContext)
       └─ LanguageProvider
            └─ PreviewEmailProvider (PreviewEmailContext)
                 └─ RecordProvider (RecordContext)
                      └─ BlocksProvider (BlocksContext)
                           └─ HoverIdxProvider (HoverIdxContext)
                                └─ ScrollProvider (ScrollContext)
                                     └─ FocusBlockLayoutProvider (FocusBlockLayoutContext)
                                          └─ FormWrapper → children
```

---

### 5.2 核心问题：为什么 Context 不够好

#### 问题 1：无法按需订阅（最大痛点）

React Context 没有 selector 机制。消费者只要 `useContext(SomeContext)`，就会在 **value 的任何部分变化时重渲染**。

**典型案例：`BlocksContext`**

```
BlocksContext = {
  focusIdx,        ← useFocusIdx() 只需要这个
  setFocusIdx,
  activeTab,       ← useActiveTab() 只需要这个
  setActiveTab,
  dragEnabled,     ← useDraggable() 只需要这个
  setDragEnabled,
  collapsed,       ← 实际上没有任何消费者使用
  setCollapsed,
  initialized,     ← useEditorContext() 只需要这个
  setInitialized,
}
```

当用户切换 `activeTab`（如从 Edit 切到 Mobile 预览），所有调用 `useFocusIdx()` 的组件也会重渲染，尽管 `focusIdx` 没有变化。同理，`focusIdx` 变化时，所有只关心 `activeTab` 的组件也会重渲染。

**量化影响**：`useFocusIdx` 被以下组件/hook 使用，任何一个 `BlocksContext` 字段变化都触发它们全部重渲染：
- `useBlock`（及其所有消费者：AttributePanel、SourceCodePanel、block 操作按钮等）
- `FocusBlockLayoutProvider`
- `StandardLayout`
- `ConfigurationDrawer`
- `BlockLayer`
- 所有 `AttributePanel` 子面板

#### 问题 2：value 对象重建（影响有限，已修正）

~~`BlocksProvider`、`HoverIdxProvider`、`ScrollProvider` 在每次渲染时都创建新的 `value` 对象，即使内部值没变。~~

**修正**：由于这些 Provider 的 children 是通过 `{props.children}` 传入的，Provider 自身只在内部 `useState` 变化时重渲染。当 state 确实变化时，无论是否 useMemo，消费者都应该重渲染。此问题影响远小于问题 1。

唯一例外是 `ScrollProvider`（只含 ref，引用稳定），加 useMemo 可以避免父级重渲染时的无意义消费者更新。

#### 问题 3：跨 Context 的复合订阅

`useBlock` hook 同时消费 **3 个 Context**（BlocksContext、RecordContext、EditorPropsContext），加上 react-final-form 的 `useFormState`。任何一个 Context 变化都触发整个 `useBlock` 重新执行，级联影响所有调用 `useBlock()` 的组件。

---

### 5.3 Zustand 的收益分析

#### 收益 1：Selector 精确订阅（最大收益）

```tsx
// 当前：订阅整个 BlocksContext，任何字段变化都重渲染
const { focusIdx, setFocusIdx } = useContext(BlocksContext);

// Zustand：仅当 focusIdx 实际变化时才重渲染
const focusIdx = useEditorStore(state => state.focusIdx);
const setFocusIdx = useEditorStore(state => state.setFocusIdx);
```

Zustand 的 selector 默认使用 `Object.is` 浅比较，只有当选中的特定值实际变化时才触发重渲染。这直接解决了 `BlocksContext` 和 `HoverIdxContext` 的广播式重渲染问题。

**预期收益**：
- `activeTab` 切换时，`useFocusIdx` 消费者 **不再重渲染**
- `focusIdx` 变化时，`useActiveTab` 消费者 **不再重渲染**
- `hoverIdx` 高频变化时，`useDataTransfer` 消费者 **不再重渲染**
- `isDragging` 变化时，仅关心 hover 的组件 **不再重渲染**

#### 收益 2：无需 useMemo 包装 Provider 值

Zustand 的 store 天然不依赖 React 渲染周期来管理状态引用，不存在 "新对象引用导致所有消费者重渲染" 的问题。直接删除所有 `useMemo(() => ({ ... }), [deps])` 和相关的 ref-cache 技巧。

#### 收益 3：简化 Provider 嵌套

当前 8 层 Provider 嵌套可以大幅扁平化：

```tsx
// 之前：8 层嵌套
<PropsProvider>
  <PreviewEmailProvider>
    <RecordProvider>
      <BlocksProvider>
        <HoverIdxProvider>
          <ScrollProvider>
            <FocusBlockLayoutProvider>
              {children}
            </FocusBlockLayoutProvider>
          </ScrollProvider>
        </HoverIdxProvider>
      </BlocksProvider>
    </RecordProvider>
  </PreviewEmailProvider>
</PropsProvider>

// 之后：Zustand store + 仅保留必要的 Provider
<EditorStoreProvider createStore={createEditorStore}>
  <PreviewEmailProvider>  {/* 保留：依赖复杂的副作用逻辑 */}
    <RecordProvider>       {/* 保留：与 react-final-form 深度耦合 */}
      {children}
    </RecordProvider>
  </PreviewEmailProvider>
</EditorStoreProvider>
```

#### 收益 4：DevTools 支持

Zustand 支持 `devtools` 中间件，可以在 Redux DevTools 中查看状态变化历史，方便调试。

```tsx
import { devtools } from 'zustand/middleware';

const useEditorStore = create(
  devtools((set) => ({
    focusIdx: getPageIdx(),
    setFocusIdx: (idx: string) => set({ focusIdx: idx }),
    // ...
  }), { name: 'EditorStore' })
);
```

#### 收益 5：外部访问 Store

Zustand store 可以在 React 组件外部读取和修改状态，这对于：
- 事件处理器中直接读取/设置状态（不需要 useRef 技巧）
- 测试中直接操作 store
- 与外部系统集成（如 AI 服务回调）

```tsx
// 组件外部直接操作
const store = useEditorStore.getState();
store.setFocusIdx('content.children.[0]');
```

---

### 5.4 Zustand 迁移的架构约束与风险

#### 约束 1：多实例隔离

当前项目使用全局 DOM ID（`VisualEditorEditMode`、`FIXED_CONTAINER_ID`），实际上 **不支持同一页面多个编辑器实例**。但如果未来需要支持，Zustand 的默认 `create()` 是模块级单例，需要改用 `createStore` + React Context 的模式：

```tsx
import { createStore, StoreApi } from 'zustand';

// 工厂函数，每个 EmailEditorProvider 实例创建一个独立 store
function createEditorStore() {
  return createStore<EditorState>((set) => ({
    focusIdx: getPageIdx(),
    setFocusIdx: (idx) => set({ focusIdx: idx }),
    // ...
  }));
}

const EditorStoreContext = React.createContext<StoreApi<EditorState> | null>(null);

function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('Missing EditorStoreProvider');
  return useStore(store, selector);
}
```

**建议**：即使当前是单实例，也推荐使用 `createStore` + Provider 模式，保持与现有 Context 的作用域一致，为未来扩展留余地。

#### 约束 2：react-final-form 的耦合

以下 Context/Provider **深度依赖 react-final-form**，不适合直接迁移到 Zustand：

| Provider | 原因 |
|----------|------|
| `RecordProvider` | `useFormState()` 监听表单变化 → 维护 undo/redo 栈 → `form.reset()` 回退表单 |
| `PreviewEmailProvider` | `useEditorContext()` → `useFormState()` 获取 `pageData` → 渲染预览 HTML |
| `FocusBlockLayoutProvider` | 依赖 `useEditorContext()` 的 `initialized` 和 Shadow DOM MutationObserver |

这些 Provider 的状态来源是 react-final-form 的 formState，**不是独立的 UI 状态**。将它们迁移到 Zustand 需要同时建立 Zustand ↔ final-form 的同步机制，收益不大但复杂度高。

#### 约束 3：公共 API 兼容

`packages/email-editor-editor/src/index.tsx` 导出了所有 hooks 作为公共 API：

```tsx
export { useActiveTab } from './hooks/useActiveTab';
export { useBlock } from './hooks/useBlock';
export { useFocusIdx } from './hooks/useFocusIdx';
export { useHoverIdx } from './hooks/useHoverIdx';
export { useEditorContext } from './hooks/useEditorContext';
// ...
```

迁移时 **必须保持这些 hook 的签名和返回值不变**，只改变内部实现。

```tsx
// 之前
export function useFocusIdx() {
  const { focusIdx, setFocusIdx } = useContext(BlocksContext);
  return { focusIdx, setFocusIdx };
}

// 之后（API 完全兼容）
export function useFocusIdx() {
  const focusIdx = useEditorStore(s => s.focusIdx);
  const setFocusIdx = useEditorStore(s => s.setFocusIdx);
  return { focusIdx, setFocusIdx };
}
```

#### 约束 4：EventManager 与 setActiveTab 的交互

`BlocksProvider` 中的 `onChangeTab` 在切换 tab 前调用 `EventManager.exec(EventType.ACTIVE_TAB_CHANGE, ...)`，如果事件处理器返回 `false` 则阻止切换。迁移到 Zustand 时需要保留这个拦截逻辑：

```tsx
// Zustand action 中保留事件拦截
setActiveTab: (nextTab) => {
  const currentTab = get().activeTab;
  const allowed = EventManager.exec(EventType.ACTIVE_TAB_CHANGE, {
    currentTab,
    nextTab,
  });
  if (allowed) {
    set({ activeTab: nextTab });
  }
},
```

---

### 5.5 推荐方案：渐进式混合迁移

**不建议一次性全部替换**，推荐分阶段迁移，每个阶段独立可验证。

#### 阶段 1：迁移 BlocksContext → Zustand（收益最大）

**原因**：
- 5 个独立 hook 消费不同子集，selector 收益最高
- 未 memo 的 value 导致广播重渲染
- `collapsed` / `setCollapsed` 是死代码，趁机清理

**Store 定义**：

```tsx
// packages/email-editor-editor/src/store/editorStore.ts
import { createStore } from 'zustand';
import { getPageIdx } from '@wa-dev/email-editor-core';
import { EventManager, EventType } from '@/utils/EventManager';

export enum ActiveTabKeys {
  EDIT = 'EDIT',
  MOBILE = 'MOBILE',
  PC = 'PC',
}

export interface EditorUIState {
  initialized: boolean;
  focusIdx: string;
  dragEnabled: boolean;
  activeTab: ActiveTabKeys;

  setInitialized: (v: boolean) => void;
  setFocusIdx: (idx: string | ((prev: string) => string)) => void;
  setDragEnabled: (v: boolean) => void;
  setActiveTab: (tab: ActiveTabKeys) => void;
}

export function createEditorUIStore() {
  return createStore<EditorUIState>((set, get) => ({
    initialized: false,
    focusIdx: getPageIdx(),
    dragEnabled: false,
    activeTab: ActiveTabKeys.EDIT,

    setInitialized: (v) => set({ initialized: v }),
    setFocusIdx: (idx) => {
      if (typeof idx === 'function') {
        set({ focusIdx: idx(get().focusIdx) });
      } else {
        set({ focusIdx: idx });
      }
    },
    setDragEnabled: (v) => set({ dragEnabled: v }),
    setActiveTab: (nextTab) => {
      const currentTab = get().activeTab;
      const allowed = EventManager.exec(EventType.ACTIVE_TAB_CHANGE, {
        currentTab,
        nextTab,
      });
      if (allowed) {
        set({ activeTab: nextTab });
      }
    },
  }));
}
```

**Provider 壳**（保持与现有结构兼容）：

```tsx
// packages/email-editor-editor/src/store/EditorStoreProvider.tsx
import { createContext, useContext, useRef } from 'react';
import { useStore, StoreApi } from 'zustand';
import { EditorUIState, createEditorUIStore } from './editorStore';

const EditorUIStoreContext = createContext<StoreApi<EditorUIState> | null>(null);

export function EditorUIStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<StoreApi<EditorUIState>>();
  if (!storeRef.current) {
    storeRef.current = createEditorUIStore();
  }
  return (
    <EditorUIStoreContext.Provider value={storeRef.current}>
      {children}
    </EditorUIStoreContext.Provider>
  );
}

export function useEditorUIStore<T>(selector: (state: EditorUIState) => T): T {
  const store = useContext(EditorUIStoreContext);
  if (!store) throw new Error('useEditorUIStore must be used within EditorUIStoreProvider');
  return useStore(store, selector);
}
```

**Hook 改造**（保持 API 兼容）：

```tsx
// useFocusIdx.ts — 之前
export function useFocusIdx() {
  const { focusIdx, setFocusIdx } = useContext(BlocksContext);
  return { focusIdx, setFocusIdx };
}

// useFocusIdx.ts — 之后
export function useFocusIdx() {
  const focusIdx = useEditorUIStore(s => s.focusIdx);
  const setFocusIdx = useEditorUIStore(s => s.setFocusIdx);
  return { focusIdx, setFocusIdx };
}

// useActiveTab.ts — 之前
export function useActiveTab() {
  const { activeTab, setActiveTab } = useContext(BlocksContext);
  return { activeTab, setActiveTab };
}

// useActiveTab.ts — 之后
export function useActiveTab() {
  const activeTab = useEditorUIStore(s => s.activeTab);
  const setActiveTab = useEditorUIStore(s => s.setActiveTab);
  return { activeTab, setActiveTab };
}
```

#### 阶段 2：迁移 HoverIdxContext → Zustand

**原因**：
- hover 和 drag 是高频操作
- `useHoverIdx` 和 `useDataTransfer` 消费不同子集但绑定在同一个 Context

**Store 定义**：

```tsx
// packages/email-editor-editor/src/store/hoverStore.ts
import { createStore } from 'zustand';

export interface DataTransfer {
  type: string;
  payload?: any;
  action: 'add' | 'move';
  positionIndex?: number;
  parentIdx?: string;
  sourceIdx?: string;
}

export interface HoverState {
  hoverIdx: string;
  isDragging: boolean;
  direction: string;
  dataTransfer: DataTransfer | null;

  setHoverIdx: (idx: string) => void;
  setIsDragging: (v: boolean) => void;
  setDirection: (d: string) => void;
  setDataTransfer: (dt: DataTransfer | null) => void;
}

export function createHoverStore() {
  return createStore<HoverState>((set) => ({
    hoverIdx: '',
    isDragging: false,
    direction: '',
    dataTransfer: null,

    setHoverIdx: (idx) => set({ hoverIdx: idx }),
    setIsDragging: (v) => set({ isDragging: v }),
    setDirection: (d) => set({ direction: d }),
    setDataTransfer: (dt) => set({ dataTransfer: dt }),
  }));
}
```

`useHoverIdx` 的 debounce 逻辑保持在 hook 层：

```tsx
export function useHoverIdx() {
  const hoverIdx = useHoverStore(s => s.hoverIdx);
  const _setHoverIdx = useHoverStore(s => s.setHoverIdx);
  const isDragging = useHoverStore(s => s.isDragging);
  const setIsDragging = useHoverStore(s => s.setIsDragging);
  const direction = useHoverStore(s => s.direction);
  const _setDirection = useHoverStore(s => s.setDirection);

  // 保留原有 debounce 行为
  const setHoverIdx = useMemo(() => debounce(_setHoverIdx, 60), [_setHoverIdx]);
  const setDirection = useMemo(() => debounce(_setDirection, 60), [_setDirection]);

  return { hoverIdx, setHoverIdx, isDragging, setIsDragging, direction, setDirection };
}
```

#### 阶段 3：优化 EditorPropsContext（可选）

`EditorPropsContext` 是低频变化的配置数据，当前已有 `useMemo`（虽然 deps 有问题），迁移收益较低。可选择：

- **方案 A**：修复 `useMemo` 的依赖问题（最小改动）
- **方案 B**：迁移到 Zustand，让消费者按需 select 特定字段

```tsx
// 方案 B 示例：只订阅 height
const height = useEditorPropsStore(s => s.height);

// 而非获取全量 props
const props = useEditorProps(); // 会随任何 prop 变化而重渲染
```

---

### 5.6 具体迁移实现

#### 步骤清单

```
1. 安装 zustand
   pnpm add zustand -w --filter @wa-dev/email-editor-editor

2. 创建 store 文件
   packages/email-editor-editor/src/store/editorStore.ts
   packages/email-editor-editor/src/store/hoverStore.ts
   packages/email-editor-editor/src/store/EditorStoreProvider.tsx

3. 修改 EmailEditorProvider
   - 在 Provider 嵌套中加入 EditorUIStoreProvider 和 HoverStoreProvider
   - 移除 BlocksProvider 和 HoverIdxProvider

4. 改造 hooks（保持 API 不变）
   - useFocusIdx.ts：BlocksContext → useEditorUIStore
   - useActiveTab.ts：BlocksContext → useEditorUIStore
   - useEditorContext.ts：BlocksContext.initialized → useEditorUIStore
   - useDragable.ts：BlocksContext → useEditorUIStore
   - useHoverIdx.ts：HoverIdxContext → useHoverStore
   - useDataTransfer.ts：HoverIdxContext → useHoverStore

5. 更新 index.tsx 导出
   - 导出 ActiveTabKeys 从 store 而非 BlocksProvider
   - 不导出 store 内部实现

6. 删除旧代码
   - BlocksProvider/index.tsx（或保留为空壳转发）
   - HoverIdxProvider/index.tsx

7. 测试
   - 所有 tab 切换、焦点选择、拖拽、hover 交互
   - 撤销/重做
   - 富文本编辑
```

#### EmailEditorProvider 改造后

```tsx
export const EmailEditorProvider = (props) => {
  // ... 现有逻辑不变
  return (
    <Form ...>
      {() => (
        <PropsProvider {...props}>
          <LanguageProvider locale={props.locale}>
            <PreviewEmailProvider>
              <RecordProvider>
                {/* 新：Zustand Store Provider */}
                <EditorUIStoreProvider>
                  <HoverStoreProvider>
                    <ScrollProvider>
                      <FocusBlockLayoutProvider>
                        <FormWrapper children={children} />
                      </FocusBlockLayoutProvider>
                    </ScrollProvider>
                  </HoverStoreProvider>
                </EditorUIStoreProvider>
              </RecordProvider>
            </PreviewEmailProvider>
          </LanguageProvider>
        </PropsProvider>
      )}
    </Form>
  );
};
```

---

### 5.7 不建议迁移的 Context

| Context | 原因 |
|---------|------|
| `RecordContext` | 与 react-final-form 深度耦合（useFormState、form.reset），且已 useMemo |
| `PreviewEmailContext` | 依赖 formState 驱动预览渲染，涉及 iframe + Shadow DOM 副作用，已 useMemo |
| `FocusBlockLayoutContext` | 依赖 MutationObserver + initialized + Shadow DOM，单字段已 useMemo |
| `ScrollContext` | 只有 ref，修复为 useMemo 即可（2 行代码），不值得引入 store |
| `ExtensionContext` | 低频配置数据，修复 isEqual Bug 即可 |
| `SelectionRangeContext` | 高频但范围小，与富文本 Shadow DOM 紧耦合，已 useMemo |
| `PresetColorsContext` | 低频，已 useMemo，消费者少 |

---

### 5.8 迁移优先级与工作量估算

| 阶段 | 内容 | 收益 | 工作量 | 风险 |
|------|------|------|--------|------|
| **阶段 1** | BlocksContext → Zustand | ⭐⭐⭐⭐⭐ 消除 5 个 hook 的交叉重渲染 | 2-3 天 | 低（hook API 不变） |
| **阶段 2** | HoverIdxContext → Zustand | ⭐⭐⭐⭐ 消除拖拽/hover 高频重渲染 | 1-2 天 | 低 |
| **阶段 3** | EditorPropsContext → Zustand（可选） | ⭐⭐ 大 props 对象的按需订阅 | 2-3 天 | 中（消费者多，需逐一验证） |
| 修复 | 其余 Context 修复 Bug + useMemo | ⭐⭐⭐ 低成本高回报 | 0.5 天 | 极低 |

---

### 5.9 结论

| 维度 | 评估 |
|------|------|
| **可行性** | ✅ **高**。Zustand 与 React 18 兼容良好，支持 `createStore` + Context 模式实现实例隔离。现有 hook 层作为 API 边界，可以在不改变消费者代码的前提下替换内部实现。 |
| **收益** | ✅ **显著**。`BlocksContext` 和 `HoverIdxContext` 是最大痛点——合并了多个独立关注点、未 memo、高频变化。Zustand 的 selector 机制直接解决按需订阅问题，预期减少 30-50% 的不必要重渲染。 |
| **风险** | ⚠️ **低但需注意**。主要风险是 react-final-form 的耦合——建议不迁移与 form 紧耦合的 Provider。保持 hook 公共 API 不变可以最小化破坏面。 |
| **推荐** | 🟢 **推荐渐进式迁移**。先做阶段 1（BlocksContext），验证收益后再做阶段 2（HoverIdxContext）。不与 form 耦合的 Context 直接替换，其余修 Bug + useMemo。|
| **包大小** | zustand gzip 后约 **1.1 KB**，对比 arco-design、mjml-browser 等现有依赖可忽略不计。|

---

## 六、优先级排序

### P0 — 立即修复（Bug + 低成本改善）

| 序号 | 项目 | 影响 | 工作量 |
|------|------|------|--------|
| 1 | ExtensionProvider 缓存 Bug（`valueRef` → `valueRef.current`） | 所有扩展消费者不必要重渲染 | 1行代码 |
| 2 | RecordProvider subTitle/subject Bug | 撤销/重做对 subject 失效 | 1行代码 |
| 3 | ScrollProvider value useMemo | 防止父级重渲染时 ref 包装对象重建 | 5行代码 |

### P1 — 短期优化（1-2 周）

| 序号 | 项目 | 影响 | 工作量 |
|------|------|------|--------|
| 4 | **BlocksContext → Zustand**（阶段 1） | 消除 5 个 hook 的交叉重渲染，最大性能收益 | 2-3天 |
| 5 | **HoverIdxContext → Zustand**（阶段 2） | 消除拖拽/hover 高频广播重渲染 | 1-2天 |
| 6 | RichTextToolBar 浮动定位 | 显著改善富文本编辑体验 | 2-3天 |
| 7 | 字号/字体回显 + 格式状态高亮 | 提升编辑直观性 | 1-1.5天 |
| 8 | PropsProvider 依赖优化 | 减少 PropsContext 消费者重渲染 | 0.5天 |

### P2 — 中期重构（2-4 周）

| 序号 | 项目 | 影响 | 工作量 |
|------|------|------|--------|
| 9 | 布局重构：配置面板左移 | 为 AI 面板腾出右侧空间 | 3-5天 |
| 10 | AI 面板从 Drawer 改为固定面板 | 更好的 AI 交互体验 | 2-3天 |
| 11 | EditorPropsContext → Zustand（可选阶段 3） | 大 props 对象的按需订阅 | 2-3天 |
| 12 | enhancer hooks 规则修复 | 代码健壮性 | 1-2天 |
| 13 | 重复代码清理（Stack、hooks） | 维护成本降低 | 1天 |

### P3 — 长期优化（按需）

| 序号 | 项目 | 影响 | 工作量 |
|------|------|------|--------|
| 14 | 组件 React.memo 包装 | 减少子树重渲染 | 2-3天 |
| 15 | 常量/命名规范化 | 代码一致性 | 1-2天 |
| 16 | 快捷键支持完善 | 提升高级用户效率 | 2-3天 |

---

> **总结**：
> 1. **P0**（立即）：修复 3 个明确的 Bug，几乎零成本就能改善质量和性能。
> 2. **P1**（1-2 周）：**Zustand 迁移阶段 1+2 是最高优先级的性能优化**，直接解决 BlocksContext 和 HoverIdxContext 的广播式重渲染问题，预期减少 30-50% 不必要重渲染。同步推进 RichTextToolBar 和属性回显的交互改进。
> 3. **P2**（2-4 周）：布局重构和 AI 集成作为独立 feature 分支推进，为后续 AI 能力释放打好基础。
> 4. 不与 react-final-form 耦合的 Context → Zustand，其余 Context 保持原样仅修 Bug + useMemo。
