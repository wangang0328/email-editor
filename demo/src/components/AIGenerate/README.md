# AI 邮件助手 - 客户端架构文档

## 📁 目录结构

```
AIGenerate/
├── index.tsx                 # 主入口组件（AI邮件助手）
├── types.ts                  # 类型定义
├── styles.scss               # 全局样式
├── mock.ts                   # 模拟数据
│
├── components/               # 子组件
│   ├── OptimizedMessage.tsx  # 消息渲染组件（核心）
│   ├── MessageList.tsx       # 消息列表容器
│   ├── ChatInput.tsx         # 聊天输入框
│   ├── EmptyState.tsx        # 空状态提示
│   ├── SendTestEmail.tsx     # 发送测试邮件
│   ├── ConversationHistory.tsx # 会话历史
│   ├── ScrollToBottomButton.tsx # 滚动到底部按钮
│   ├── VirtualScrollbar.tsx  # 虚拟滚动条
│   ├── MessageNode.tsx       # 消息节点
│   └── SideIndicator/        # 侧边指示器
│
├── hooks/                    # 自定义 Hooks
│   ├── useSmartScroll.ts     # 智能滚动控制
│   ├── useStreamingOptimization.ts # 流式优化
│   ├── useVirtualScroll.tsx  # 虚拟滚动
│   ├── useVirtualList.ts     # 虚拟列表
│   ├── useOptimizedHover.ts  # 悬浮优化
│   └── useScrollSync.ts      # 滚动同步
│
└── utils/
    └── mjmlExtractor.ts      # MJML 提取工具
```

---

## 🎯 核心组件说明

### 1. 主入口 `index.tsx`

**职责**：AI 邮件助手的入口，管理会话状态和消息流。

**核心状态**：
```typescript
// 会话状态
const [conversations, setConversations] = useState<Conversation[]>([]);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);

// 流式生成状态
const [loading, setLoading] = useState(false);
const [streamingContent, setStreamingContent] = useState('');
```

**核心流程**：
1. 用户输入 → `handleSend()` 发送消息
2. 调用 `services.ai.generateStream()` 流式请求
3. `onChunk` 回调逐块更新消息内容
4. `onDone` 完成后提取 MJML 并保存

---

### 2. 消息渲染 `OptimizedMessage.tsx`

**职责**：渲染单条消息，支持 Markdown 和 MJML 代码块。

**核心逻辑**：

```
消息内容
    │
    ▼
splitContentAroundMjml() ─── 拆分为文本和MJML片段
    │
    ├── 文本部分 → TextContent 组件 → ReactMarkdown 渲染
    │
    └── MJML部分 → MjmlCodeBlock 组件 → 代码高亮显示
```

**Markdown 渲染优化**：
```typescript
// 自定义代码渲染器
const CodeRenderer = ({ node, className, children, ...props }) => {
  const content = String(children).replace(/\n$/, '');
  const hasLanguage = className && /language-/.test(className);
  const isMultiLine = content.includes('\n');

  // 多行 → 代码块（pre + code）
  // 单行 → 行内代码（code.inline-code）
  if (hasLanguage || isMultiLine) {
    return <pre className="code-block"><code>{children}</code></pre>;
  }
  return <code className="inline-code">{children}</code>;
};
```

---

### 3. 智能滚动 `useSmartScroll.ts`

**职责**：管理消息列表的滚动行为，区分用户操作和程序滚动。

**核心算法**：

```
┌─────────────────────────────────────────────────────────┐
│                    滚动事件处理                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   用户滚动？ ────是──→ 标记用户交互                      │
│       │                   │                             │
│       否                  ▼                             │
│       │              向上滚动？                          │
│       ▼                   │                             │
│   程序滚动             是│ 否                           │
│       │               │  └──→ 检查是否在底部            │
│       ▼               │           │                    │
│   更新滚动条位置       │        在底部                  │
│                       │           │                    │
│                       ▼           ▼                    │
│                  禁用自动滚动  恢复自动滚动              │
│                  显示未读计数  清除未读计数              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**关键状态**：
```typescript
interface ScrollState {
  isUserInteracting: boolean;      // 用户正在交互
  userInterrupted: boolean;        // 用户中断了自动滚动
  autoScrollEnabled: boolean;      // 是否启用自动滚动
  distanceFromBottom: number;      // 距离底部的距离
  unreadCount: number;             // 未读消息计数
}
```

---

### 4. MJML 提取 `mjmlExtractor.ts`

**职责**：从 AI 响应中提取 MJML 代码，处理流式生成的不完整情况。

**处理流程**：

```
AI 响应内容
    │
    ▼
┌──────────────────────────────────────┐
│  1. 尝试从 ```mjml 代码块提取        │
│     - 支持不完整的代码块             │
│     - 分离混入的 Markdown 文本       │
├──────────────────────────────────────┤
│  2. 尝试直接匹配 <mjml>...</mjml>    │
├──────────────────────────────────────┤
│  3. 容错处理                         │
│     - 修复 broken closing tag       │
│       如 </mj-body已 → </mj-body>   │
│     - 补全缺失的闭合标签            │
└──────────────────────────────────────┘
    │
    ▼
提取的 MJML 代码
```

**容错示例**：
```javascript
// 输入（AI 流式生成被截断）
"</mj-body已为您生成一个模板！"

// 处理后
"</mj-body>"  // 修复 broken tag
"已为您生成一个模板！"  // 分离为文本
```

---

### 5. 流式优化 `useStreamingOptimization.ts`

**职责**：优化流式生成时的渲染性能。

**优化策略**：
1. **批量更新**：将多个 chunk 合并后一次性更新
2. **防抖处理**：避免过于频繁的 DOM 更新
3. **帧率控制**：限制每秒最大更新次数（默认 30fps）

```typescript
// 配置项
interface StreamingOptimizationOptions {
  batchSize?: number;           // 批量大小
  debounceMs?: number;          // 防抖延迟（默认 50ms）
  maxUpdatesPerSecond?: number; // 最大更新频率（默认 30）
}
```

---

## 🔄 数据流图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户操作                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌──────────┐      ┌──────────┐      ┌──────────┐               │
│    │ 输入消息  │ ──→ │ 发送请求  │ ──→ │ 流式响应  │               │
│    └──────────┘      └──────────┘      └──────────┘               │
│                                              │                      │
│                                              ▼                      │
│                      ┌─────────────────────────────────────┐       │
│                      │          onChunk 回调               │       │
│                      │  - 更新 streamingContent           │       │
│                      │  - 更新消息列表                     │       │
│                      │  - 触发智能滚动                     │       │
│                      └─────────────────────────────────────┘       │
│                                              │                      │
│                                              ▼                      │
│                      ┌─────────────────────────────────────┐       │
│                      │          onDone 回调                │       │
│                      │  - 提取 MJML 代码                  │       │
│                      │  - 检测完整性                       │       │
│                      │  - 尝试修复（如需要）               │       │
│                      │  - 保存到数据库                     │       │
│                      └─────────────────────────────────────┘       │
│                                              │                      │
│                                              ▼                      │
│    ┌──────────────────────────────────────────────────────────┐   │
│    │                     消息列表更新                          │   │
│    │  - MessageList 接收新消息                                │   │
│    │  - OptimizedMessage 渲染每条消息                         │   │
│    │  - 虚拟滚动优化（消息量大时）                            │   │
│    └──────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 样式架构

### CSS 类命名规范

```scss
// 组件容器
.ai-generate-drawer {}
.chat-container {}
.messages-list {}

// 消息相关
.chat-message {}
.chat-message.user {}       // 用户消息
.chat-message.assistant {}  // AI 消息
.message-avatar {}
.message-content {}
.message-text {}
.message-text.streaming {}  // 流式生成中

// Markdown 渲染
.md-paragraph {}
.md-list {}
.md-list-item {}
.md-link {}
.inline-code {}             // 行内代码
pre.code-block {}           // 代码块

// MJML 相关
.mjml-code-block {}
.mjml-code-header {}
.mjml-code-content {}
.mjml-action-bar {}
```

### 行内代码样式修复

```scss
// 确保行内代码真正行内显示
code.inline-code {
  display: inline !important;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  white-space: normal;
  word-break: break-word;
}
```

---

## ⚡ 性能优化

### 1. 虚拟滚动

当消息超过阈值（默认 30 条）时启用：

```typescript
const virtualScroll = useVirtualScroll(messages, {
  itemHeight: 120,        // 预估消息高度
  containerHeight: 400,   // 容器高度
  overscan: 3,            // 缓冲区大小
  threshold: 30,          // 启用阈值
});
```

### 2. 渲染缓存

```typescript
const { getCachedRender } = useMessageRenderOptimization();

// 使用缓存渲染
getCachedRender(
  cacheKey,           // 缓存键
  content,            // 内容
  renderFn,           // 渲染函数
  ttl                 // 缓存时间（流式 100ms，静态 5000ms）
);
```

### 3. 滚动优化

- **Delta 策略**：使用 `scrollHeight` 变化量增量更新滚动位置
- **RAF 调度**：使用 `requestAnimationFrame` 避免布局抖动
- **防抖处理**：滚动事件 16ms 防抖（约 60fps）

---

## 🔧 常见问题

### Q1: 行内代码显示为块级元素

**原因**：`react-markdown` v10 的 `code` 组件不再有 `inline` 属性

**解决**：通过检测内容特征判断：
```typescript
const hasLanguage = className && /language-/.test(className);
const isMultiLine = content.includes('\n');
// 有语言标识或多行 → 代码块
// 否则 → 行内代码
```

### Q2: 流式生成时滚动跳动

**原因**：`scrollTop` 直接设置导致布局抖动

**解决**：使用 delta 策略：
```typescript
const delta = currentScrollHeight - prevScrollHeight;
if (delta > 0) {
  container.scrollTop += delta;
}
```

### Q3: MJML 代码被截断

**原因**：AI 流式生成时 `max_tokens` 耗尽

**解决**：客户端自动修复：
```typescript
const repaired = repairIncompleteMjml(mjml);
if (repaired) {
  mjml = repaired;
  console.warn('自动修复不完整的 MJML');
}
```

---

## 📊 组件关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        AIGenerate                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Drawer                               │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │                chat-container                      │  │   │
│  │  │                                                    │  │   │
│  │  │  ┌──────────────┐  ┌────────────────────────────┐│  │   │
│  │  │  │ SideIndicator│  │      MessageList           ││  │   │
│  │  │  │              │  │  ┌────────────────────┐    ││  │   │
│  │  │  │ • 消息导航   │  │  │  OptimizedMessage  │    ││  │   │
│  │  │  │ • 快速定位   │  │  │  • TextContent     │    ││  │   │
│  │  │  │              │  │  │  • MjmlCodeBlock   │    ││  │   │
│  │  │  └──────────────┘  │  └────────────────────┘    ││  │   │
│  │  │                    │  ┌────────────────────┐    ││  │   │
│  │  │                    │  │  VirtualScrollbar  │    ││  │   │
│  │  │                    │  └────────────────────┘    ││  │   │
│  │  │                    └────────────────────────────┘│  │   │
│  │  │                                                    │  │   │
│  │  │  ┌────────────────────────────────────────────┐  │  │   │
│  │  │  │ ScrollToBottomButton                       │  │  │   │
│  │  │  └────────────────────────────────────────────┘  │  │   │
│  │  │                                                    │  │   │
│  │  │  ┌────────────────────────────────────────────┐  │  │   │
│  │  │  │           ChatInput                        │  │  │   │
│  │  │  └────────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ConversationHistory                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 相关文档

- [滚动解决方案](./SCROLL_SOLUTION.md)
- [服务端架构](../../../server/docs/architecture.md)
- [图片处理服务](../../../server/services/imageService.ts)
