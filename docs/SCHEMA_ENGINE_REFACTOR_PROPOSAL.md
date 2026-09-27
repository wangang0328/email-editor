## schema + engine 激进重构提案（问题清单与方案）

> 背景：仓库已升级 React/调整 UI 框架，本次本身就是破坏性变更窗口。建议趁机将 `email-editor-core` 的"领域 + React 渲染 + 全局注册"混合职责拆开，用 **`schema` + `engine`** 两层把边界彻底定死，为后续插件契约化（manifest）与多实例隔离铺路。

---

## 1. 现状问题（以 `email-editor-core` 为中心）

### 1.1 `core` 职责混杂，导致边界失效

- **领域模型与 UI 渲染混在一个包**：`core` 里存在大量 `tsx` 组件与 block `render()`（`ReactNode`），导致它无法作为"纯领域层"被复用或在 Node 环境跑测试。
- **注册中心是全局 static**：`BlockManager` 以 static map 维护 blocks，并通过 `registerBlocks()` 改写全局状态 → 天然不支持 **多 runtime 实例隔离**。
- **对外 API 语义不清晰**：外部使用者（含 `editor/extensions`）把 `core` 当成"什么都能从这里拿"的入口，进一步放大耦合与升级成本。

### 1.2 工程链路对破坏性变更不敏感

- `editor` 与 `extensions` 对 `@wa-dev/email-editor-core` 的开发期引用策略不一致（一个 alias 源码，一个 alias 构建产物），容易出现"本地能跑，构建/发布出问题"的隐患。

---

## 2. 目标（激进版）

### 2.1 名字与边界（schema / engine）

- **`schema`**：只放"数据结构 + 规则 + 转换"的确定性逻辑
  - 例如：block 数据结构、类型系统、树操作、校验、MJML/HTML/JSON 转换、纯函数工具
  - **硬约束**：不依赖 React/DOM；可在 Node 环境运行与测试
- **`engine`**：只放"运行时装配 + 插件容器 + 生命周期"的有状态逻辑
  - 例如：插件 manifest、registry、依赖排序、生命周期、依赖注入（services）
  - **硬约束**：禁止隐式全局单例；支持多实例 runtime（一个页面多个 editor 互不干扰）

> 备注：`editor` 仍是 UI 宿主（Provider/画布/交互）；`extensions` 更名为 `preset`（表达"默认产品预设 UI"，避免与"插件系统"概念混淆）。本提案将其视为与 schema/engine 同步推进的一部分：对外主入口调整为 `@wa-dev/email-editor-preset`，并为旧包名保留短期兼容 re-export（同一个主版本周期内）。

### 2.2 "破坏性窗口"的取舍

- **优先做正确的边界**，而非维持历史兼容层的完整性。
- 仍建议保留最小兼容：提供一个默认 engine 单例作为过渡，但 **不再新增旧 API**。

---

## 3. 拆分方案（推荐包结构）

### 3.0 包职责边界判定规则（关键）

为避免"该放哪儿"的争议，明确三层包的边界：

#### `@wa-dev/email-editor-shared`（已存在）
**职责**：跨包通用、与邮件编辑领域无关/弱相关的工具
- 通用工具函数（字符串/数组/对象处理、类型工具、`classnames` 等）
- 静态常量/资源元数据（图标映射、通用配置）
- 小型基础设施（logger、env 判断）

**硬约束**：
- ✅ 禁止出现 "block/mjml/template/email" 等领域语义（除非是静态资源元数据）
- ✅ 不依赖 React/DOM

**判定规则**：❓ 这个工具在"非邮件编辑项目"里也有用吗？
- 有用 → shared
- 没用 → schema

---

#### `@wa-dev/email-editor-schema`（新增）
**职责**：邮件编辑领域的数据模型、规则、转换（纯逻辑）
- Block 数据结构、类型系统、树操作（`getPageIdx`、`getParentByIdx` 等）
- MJML/HTML/JSON 转换、校验、merge
- Template/i18n 的**纯函数部分**（render/format 逻辑，但不包含 Manager 单例）

**硬约束**：
- ✅ 不依赖 React/DOM（可在 Node 环境运行）
- ✅ 不包含全局单例/有状态服务
- ✅ 可以依赖 shared

**判定规则**：❓ 这个逻辑是"领域规则"还是"运行时状态管理"？
- 纯规则/转换 → schema
- 状态管理/服务 → engine

---

#### `@wa-dev/email-editor-engine`（新增）
**职责**：运行时容器、插件系统、有状态服务
- 插件 manifest、registry、生命周期、依赖排序
- 服务容器（ImageService、TemplateService、I18nService）
- 事件总线、命令系统

**硬约束**：
- ✅ 禁止全局 static 单例（所有状态属于 engine 实例）
- ✅ 支持多实例隔离
- ✅ 可以依赖 schema + shared

**判定规则**：❓ 这个东西需要"在 engine 实例间隔离"吗？
- 需要隔离 → engine
- 不需要（纯函数） → schema

---

### 3.1 新增/调整的包（详细）

#### A) `@wa-dev/email-editor-schema`（新）

包含：
- 纯类型与数据结构：`IBlockData` 等（移除任何 `ReactNode`）
- 树/idx 操作：`getPageIdx`、`getParentByIdx`、`getSiblingIdx`、`getChildIdx`、`getNodeIdxClassName` 等
- 转换与校验：`JsonToMjml`、`MjmlToJson`、`isValidBlockData`、`mergeBlock`
- Template/i18n 的纯逻辑部分（render/format 函数，不包含 Manager）

不包含：
- `render()` / React 组件 / TSX blocks
- 全局注册中心（BlockManager static）
- 有状态的 Manager 类

#### B) `@wa-dev/email-editor-engine`（新）

包含：
- `EmailEditorPlugin`（manifest）与贡献点（contributions）
- `EmailEditorEngine`：`use/useMany/init/dispose`
- `registry`（blocks/commands/ui/hooks/transforms 等分桶）
- **services 容器**（替代原有全局 Manager，可覆盖、可测试）：
  - `ImageService`（替代 `ImageManager` static）
  - `TemplateService`（替代 `TemplateEngineManager` static）
  - `I18nService`（替代 `I18nManager` static，翻译数据由外部传入）
  - 其他需要状态管理的服务（logger、telemetry 等）

关键行为：
- **支持多实例**：`createEngine(config?)` 返回隔离实例，每个实例有独立的 registry + services
- **提供过渡兼容**：`getDefaultEngine()`（可选），用于旧 API 代理到默认实例
- **依赖注入**：插件通过 `ctx.services.get('image')` 获取服务，支持测试时 mock

#### C) React 渲染 blocks（去向二选一）

**选择 1**：新包 `@wa-dev/email-editor-blocks-react`
- 将现有 `core/src/blocks/**`（含 TSX）迁入，并以"插件"形式导出：`standardBlocksPlugin()`、`advancedBlocksPlugin()`

**选择 2**：并入 `@wa-dev/email-editor-editor`
- 若你希望更激进，直接把 TSX blocks 视作 editor 的一部分，减少一个包的维护面

> 两个选择的差异：是否希望 blocks 渲染可被多个宿主复用。若未来可能有不同宿主（比如只渲染预览、不含编辑器 UI），建议选新包。

---

### 3.2 避免重复维护的工程规则（强制）

#### 1) 禁止跨包复制代码
- 若 A 包和 B 包都需要同一工具，必须下沉到 shared 或 schema
- 用 `eslint-plugin-import` 配置 `no-restricted-imports` 检测跨包复制

#### 2) 单一职责包不得"反向依赖"
- schema 不得依赖 engine（单向：engine → schema）
- preset 不得依赖 editor 的内部实现（单向：preset → editor 的公开 API）

#### 3) 类型定义的唯一数据源
- Block 的类型必须在 schema 定义，renderer 通过 import 复用
- 禁止在 renderer 里重新定义类型（用 ESLint 规则检查）

---

## 4. 插件契约（manifest）详细设计

### 4.1 EmailEditorPlugin 接口定义

```typescript
interface EmailEditorPlugin {
  // ===== 元信息 =====
  id: string;                        // 唯一标识（建议：反向域名风格，如 '@preset/button'）
  version?: string;                  // 插件版本（用于日志/诊断）
  displayName?: string;              // 显示名称
  description?: string;              // 描述
  
  // ===== 依赖与冲突 =====
  requires?: string[];               // 依赖的插件 id（engine 会做拓扑排序）
  optional?: string[];               // 可选依赖（存在则增强，不存在也能工作）
  conflicts?: string[];              // 冲突的插件 id（同时装载会报错）
  
  // ===== 贡献点声明（可选，主要用于静态分析/文档生成） =====
  contributions?: {
    blocks?: Array<{ type: string; category?: string }>;
    transforms?: Array<{ format: 'mjml' | 'html'; direction: 'import' | 'export' }>;
    commands?: Array<{ id: string; displayName: string }>;
    // ... 更多贡献点类型可按需扩展
  };
  
  // ===== 实例化入口 =====
  setup(ctx: PluginContext): PluginInstance | void;
}

interface PluginContext {
  engine: EmailEditorEngine;         // 当前 engine 实例
  registry: Registry;                // 快捷访问 registry（等价于 engine.registry）
  services: ServiceContainer;        // 依赖注入容器（获取 ImageService 等）
  logger: Logger;                    // 日志服务（自动带插件 id 前缀）
  config?: Record<string, any>;      // 插件配置（由外部传入）
}

interface PluginInstance {
  dispose?(): void;                  // 清理回调（engine.dispose() 时调用）
  getState?(): any;                  // 可选：导出插件私有状态（用于持久化/调试）
  setState?(state: any): void;       // 可选：恢复插件私有状态
}
```

---

### 4.2 Block 插件开发规范（类型共享方案）

#### 问题背景
Block 的 schema 和 renderer 分离后，如果类型/配置分别维护，容易出现"改了 schema 忘了改 renderer"的问题。

#### 解决方案：类型共享 + 插件内聚

**核心原则**：
1. **schema 是类型的唯一定义源**，renderer 通过 import 获得类型
2. **同一个 block 的 schema + renderer 必须在同一个插件包内**（强制 co-location）
3. **插件注册时同时注册 schema + renderer**，确保配对

---

#### 标准插件结构（强制）

每个 block 插件必须按以下结构组织：

```
plugins/button/
  ├── schema.ts       # 定义 IButton 接口 + buttonSchema（无 React）
  ├── renderer.tsx    # 定义 ButtonRenderer（导入 schema 的类型）
  ├── index.ts        # 导出 buttonPlugin，同时注册 schema + renderer
  └── README.md       # 可选：插件说明
```

---

#### 完整示例：Button 插件

**1) `plugins/button/schema.ts`（无 React 依赖）**

```typescript
import { BlockSchema } from '@wa-dev/email-editor-schema';

// ===== 类型定义（唯一数据源） =====
export interface IButton {
  type: 'button';
  data: {
    value: {
      content: string;
    };
  };
  attributes: {
    href: string;
    target: '_blank' | '_self';
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    padding: string;
  };
  children: [];
}

// ===== Schema 定义 =====
export const buttonSchema: BlockSchema<IButton> = {
  type: 'button',
  displayName: 'Button',
  category: 'basic',
  
  // 父级约束
  validParentType: ['column', 'group', 'hero'],
  
  // 默认值工厂
  create: (payload) => ({
    type: 'button',
    data: { 
      value: { 
        content: payload?.data?.value?.content || 'Click me' 
      } 
    },
    attributes: {
      href: '#',
      target: '_blank',
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      borderRadius: '4px',
      padding: '10px 20px',
      ...payload?.attributes,  // 允许覆盖
    },
    children: [],
  }),
  
  // 校验规则
  validate: (data) => {
    const errors: string[] = [];
    if (!data.attributes.href) {
      errors.push('Button href is required');
    }
    if (!data.data.value.content?.trim()) {
      errors.push('Button content cannot be empty');
    }
    return errors.length > 0 ? errors : true;
  },
};
```

**2) `plugins/button/renderer.tsx`（React 渲染）**

```tsx
import React from 'react';
import { BlockRenderer } from '@wa-dev/email-editor-engine';
import { IButton } from './schema';  // ← 导入类型，不重复定义

export const ButtonRenderer: BlockRenderer<IButton> = ({ 
  data, 
  idx, 
  mode, 
  context 
}) => {
  const { content } = data.data.value;
  const { 
    href, 
    target, 
    backgroundColor, 
    textColor,
    borderRadius,
    padding 
  } = data.attributes;
  
  const style: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor,
    color: textColor,
    borderRadius,
    padding,
    textDecoration: 'none',
    cursor: 'pointer',
  };
  
  // 根据 mode 调整行为
  if (mode === 'testing') {
    // 编辑模式：禁用链接跳转
    return (
      <span style={style} onClick={(e) => e.preventDefault()}>
        {content}
      </span>
    );
  }
  
  // 生产模式：正常渲染
  return (
    <a href={href} target={target} style={style}>
      {content}
    </a>
  );
};
```

**3) `plugins/button/index.ts`（插件入口）**

```typescript
import { EmailEditorPlugin } from '@wa-dev/email-editor-engine';
import { buttonSchema, IButton } from './schema';
import { ButtonRenderer } from './renderer';

export const buttonPlugin = (): EmailEditorPlugin => ({
  id: '@preset/button',
  version: '1.0.0',
  displayName: 'Button Block',
  
  contributions: {
    blocks: [{ type: 'button', category: 'basic' }],
  },
  
  setup(ctx) {
    const { registry } = ctx;
    
    // 同时注册 schema 和 renderer（确保配对）
    registry.blocks.registerSchema(buttonSchema);
    registry.blocks.registerRenderer<IButton>('button', ButtonRenderer);
    
    // 可选：注册相关命令
    registry.commands.register({
      id: 'insertButton',
      displayName: 'Insert Button',
      execute: (editor) => {
        const button = buttonSchema.create();
        editor.insertBlock(button);
      },
    });
  },
});

// 导出类型供其他插件使用
export type { IButton };
```

---

#### 使用插件

```typescript
import { createEngine } from '@wa-dev/email-editor-engine';
import { buttonPlugin } from './plugins/button';
import { imagePlugin } from './plugins/image';

const engine = createEngine();

// 注册插件
engine.use(buttonPlugin());
engine.use(imagePlugin());

// 初始化（会按依赖顺序调用所有 setup）
await engine.init();

// 获取注册的 blocks
const buttonSchema = engine.registry.blocks.getSchema('button');
const buttonRenderer = engine.registry.blocks.getRenderer('button');
```

---

### 4.3 Schema 与 Renderer 配对检查（防止运行时错误）

#### 问题
分离后可能出现"有 schema 无 renderer"或"有 renderer 无 schema"，导致运行时崩溃。

#### 解决方案

**1) 开发期检查（在 `engine.init()` 时）**

```typescript
class EmailEditorEngine {
  async init() {
    // ... 拓扑排序 + 调用 setup ...
    
    // 配对检查
    this.validateBlockPairing();
  }
  
  private validateBlockPairing() {
    const schemas = this.registry.blocks.getSchemas();
    const renderers = this.registry.blocks.getRenderers();
    
    // 检查：有 schema 但没 renderer
    schemas.forEach(({ type }) => {
      if (!renderers.has(type)) {
        this.logger.warn(
          `Block "${type}" 已注册 schema 但缺少 renderer（可能导致渲染失败）`
        );
      }
    });
    
    // 检查：有 renderer 但没 schema
    renderers.forEach((_, type) => {
      if (!schemas.has(type)) {
        this.logger.error(
          `Block "${type}" 已注册 renderer 但缺少 schema（必须修复）`
        );
      }
    });
  }
}
```

**2) 运行时降级（在 editor 渲染时）**

```tsx
// editor 包内的渲染逻辑
function renderBlock(blockData: IBlockData, engine: EmailEditorEngine) {
  const renderer = engine.registry.blocks.getRenderer(blockData.type);
  
  if (!renderer) {
    // 回退到通用的 Fallback 渲染器
    return (
      <FallbackBlockRenderer type={blockData.type}>
        Block type "{blockData.type}" has no renderer registered.
      </FallbackBlockRenderer>
    );
  }
  
  return renderer({ data: blockData, mode: 'testing' });
}
```

**3) 工具链辅助（ESLint 规则）**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 自定义规则：renderer.tsx 必须从同目录 schema.ts 导入类型
    'local/renderer-must-import-schema': 'error',
  },
};
```

---

### 4.4 彻底解决多实例隔离

- ✅ 任何注册都进入 `engine` 实例的 registry（而非全局 static）
- ✅ 不允许通过 `BlockManager.registerBlocks()` 这类全局方法注册
- ✅ 每个 engine 实例有独立的 services 容器（ImageService/TemplateService 等）
- ✅ 插件的 dispose() 回调由 engine 负责调用，清理时不影响其他实例

---

### 4.5 Block 组件分散问题及标准化方案

#### 问题现状（以 Button 为例）

当前 Button 组件的相关代码分散在多个位置，存在以下问题：

**1. 分散在 3 个不同位置**（~~`mjml/jsx`~~ 已于 2026-06 删除，见 [`MJML_JSX_MIGRATION.md`](./MJML_JSX_MIGRATION.md)）

```
packages/email-editor-blocks-react/src/
  ├── plugins/standard/button/
  │   ├── schema.ts           # ✅ 类型定义 + 默认值
  │   ├── renderer.tsx        # ✅ 渲染逻辑（mjml 转换）
  │   └── index.ts            # ✅ 插件导出
  │
  └── mjml/core/MjmlBlock.tsx # ✅ 自定义块 JSX 入口（替代原 jsx/Button.tsx）

packages/email-editor-preset/src/
  └── AttributePanel/components/blocks/Button/
      └── index.tsx           # ❌ 属性面板 UI（与插件分离）
```

**2. 命名混淆**

- ~~`Button` (jsx builder)~~ → 已移除，改用 `MjmlBlock type={BasicType.BUTTON}`
- `Button` (plugin export from standard) - 插件导出
- `Button` (AttributePanel component) - 属性面板组件
- `buttonDefinition` - schema 定义
- `buttonRender` - 渲染函数
- `IButton` - 类型定义

**3. 维护困难**

- 修改 Button 属性时需要同步 schema、renderer、属性面板（~~jsx builder~~ 已删）
- 属性面板与 schema 的字段可能不一致（无类型约束）
- ~~JSX builder~~ 已与 `MjmlBlock` / `schema.create()` 收敛

---

#### 问题根源分析

1. **历史遗留**：
   - 最初 `mjml/jsx/*.tsx` 是主要的块定义方式（JSX builder pattern）
   - 后来引入 plugin 体系；**jsx 目录已于 2026-06 删除**，由 `MjmlBlock` 统一入口
   - 属性面板仍在 preset 包独立维护（待 Step 2 迁移）

2. **职责不清**：
   - ~~JSX builder~~ 已与 `schema.create()` / `MjmlBlock` 收敛（已完成）
   - 属性面板应该属于 block 的一部分还是 preset 的一部分？

3. **依赖方向错误**：
   - 属性面板理应依赖 block schema 的类型，但当前是分离的
   - 导致修改 schema 后，属性面板可能不更新

---

#### 标准化方案（强制）

**核心原则**：**一个 block = 一个插件目录 = 所有相关代码的唯一位置**

**标准插件结构**：

```
packages/email-editor-blocks-react/src/plugins/standard/button/
  ├── schema.ts           # 类型定义 + 默认值（无 React）
  ├── renderer.tsx        # MJML 渲染逻辑（导入 schema 类型）
  ├── panel.tsx           # 属性面板 UI（导入 schema 类型）
  ├── index.ts            # 统一导出（plugin + types）
  └── README.md           # 可选：使用说明

packages/email-editor-preset/src/AttributePanel/
  └── index.tsx           # 仅保留路由逻辑（根据 block.type 选择 panel）
```

**职责划分**：

| 文件 | 职责 | 依赖 | 是否允许 React |
|------|------|------|----------------|
| `schema.ts` | 类型定义 + 默认值工厂 + 校验规则 | 无（纯数据） | ❌ |
| `renderer.tsx` | MJML 渲染逻辑 | schema.ts | ✅ |
| `panel.tsx` | 属性编辑面板 UI | schema.ts | ✅ |
| `index.ts` | 插件注册 + 导出 | 上述所有 | ✅ |

---

#### 迁移步骤

**Step 1：移除冗余的 JSX builder** — ✅ **已完成**

- ~~`mjml/jsx/*.tsx`~~ 已删除；自定义块改用 `MjmlBlock`（支持顶层 attribute props）
- 内部引用已迁：`generateAdvancedContentBlock`、`TemplateEngineManager`、`createCustomBlock.test`
- 迁移说明：[`MJML_JSX_MIGRATION.md`](./MJML_JSX_MIGRATION.md)
- **替代**：`MjmlBlock` + `BasicType.*`，或 `*Definition.create()` + `BlockRenderer`

**Step 2：迁移属性面板到插件内** — ✅ **Button 已完成**

- 实现：`plugins/standard/button/panel.tsx`
- 路由：`preset/AttributePanel/components/blocks/index.ts` → `ButtonPanel`
- 已删除：`preset/.../blocks/Button/index.tsx`

```typescript
// 新增：plugins/standard/button/panel.tsx
import React from 'react';
import { BlockAttributePanel } from '@wa-dev/email-editor-preset';
import type { IButton } from './schema';

export const ButtonPanel: BlockAttributePanel<IButton> = ({ data, onChange }) => {
  // 从原 AttributePanel/components/blocks/Button/index.tsx 迁移 UI
  return (
    <AttributesPanelWrapper>
      {/* ... 原有的表单 UI ... */}
    </AttributesPanelWrapper>
  );
};
```

**Step 3：更新插件导出**

```typescript
// 更新：plugins/standard/button/index.ts
import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IButton } from './schema';
import { buttonDefinition } from './schema';
import { buttonRender } from './renderer';
import { ButtonPanel } from './panel';  // 新增

export type { IButton } from './schema';
export { buttonDefinition } from './schema';
export { ButtonPanel } from './panel';  // 导出面板

export const Button = defineBlock<IButton>(buttonDefinition, buttonRender, {
  panel: ButtonPanel,  // 注册属性面板
});
```

**Step 4：更新 preset 的属性面板路由**

```typescript
// packages/email-editor-preset/src/AttributePanel/index.tsx
import { ButtonPanel } from '@wa-dev/email-editor-blocks-react/plugins/standard/button';
import { ImagePanel } from '@wa-dev/email-editor-blocks-react/plugins/standard/image';

const panelRegistry = {
  [BasicType.BUTTON]: ButtonPanel,
  [BasicType.IMAGE]: ImagePanel,
  // ...
};

export function AttributePanel({ blockType }) {
  const Panel = panelRegistry[blockType];
  return Panel ? <Panel /> : <DefaultPanel />;
}
```

**Step 5：删除旧的属性面板文件**

```bash
# 删除
rm -rf packages/email-editor-preset/src/AttributePanel/components/blocks/Button/
```

---

#### 验收标准

- ✅ 每个 block 的所有代码在同一个插件目录
- ✅ 属性面板通过 import 复用 schema 的类型（TypeScript 强制检查）
- ✅ 修改 schema 时，renderer 和 panel 会出现类型错误（确保同步）
- ✅ ~~移除 JSX builder~~（已完成，见 `MJML_JSX_MIGRATION.md`）
- ✅ `preset` 的 AttributePanel 仅保留路由逻辑（< 100 行代码）

---

#### 注意事项

**1. 属性面板的位置选择**

- **方案 A**（推荐）：panel 在 blocks-react 插件内
  - 优点：块的所有逻辑内聚，易于维护
  - 缺点：blocks-react 需要依赖 UI 组件库
  
- **方案 B**：panel 仍在 preset 包，但强制导入 schema 类型
  - 优点：blocks-react 保持纯渲染职责
  - 缺点：仍然分散，但至少有类型约束

**建议**：采用方案 A，因为 blocks-react 已经依赖 React，增加 UI 组件依赖不会破坏边界。

**2. JSX builder 的处理**

- 如果 JSX builder 仍有外部使用（如文档/测试），保留但标记 deprecated
- 提供迁移指南：`<Button {...} />` → `buttonDefinition.create({ ... })`

**3. 属性面板的复用**

部分属性面板组件（如 `Padding`、`Color`、`Border`）是通用的，应该：
- 保留在 `preset/AttributePanel/attributes/` 目录
- 由各个 block 的 panel 导入复用
- 这些通用组件不需要迁移

---

## 5. 迁移路线（激进但可控）

> **进度（2026-06-02）**
> - [x] **Step 0（部分）**：`editor` / `preset` Vite alias 统一指向 workspace 源码；`engine` 加入根 build 脚本；demo 使用 `@wa-dev/email-editor-preset`
> - [x] **Step 1（部分）**：`@wa-dev/email-editor-engine`；`core` 导出 `getBlockByType` / `getAutoCompletePath`；**editor、preset、demo** 已改用 engine registry；`BlockManager` 仅作 compat
> - [x] **Step 2（部分）**：`schema` 含 `isValidBlockDataShape`、`JsonToMjmlOption` 类型；`core` re-export；`JsonToMjml` 实现仍留在 core（依赖 React 渲染）
> - [x] **Step 3**：`@wa-dev/email-editor-blocks-react`；`bootstrap` 使用 `standardBlocksPlugin`
> - [x] **Step 4**：`@wa-dev/email-editor-preset` 为默认 UI 入口；**已删除 `@wa-dev/email-editor-extensions` 兼容包**
> - [ ] **Step 5**：Block 组件标准化 - 清理分散文件，统一到插件目录（见 4.5 节）

### 5.1 Step 0：统一依赖入口（降低工程噪音）

- 统一 `editor/extensions` 对 workspace 包的引用方式：开发期与构建期保持一致（建议都走 workspace 入口，而不是一个指向 `src` 一个指向 `lib`）
- 收口对外入口：新增 `exports` 后禁止 deep import（若已做 P0，这一步是强化）

### 5.2 Step 1：先落地 `engine`（替换 global registry）

- 新增 `engine` 包与最小 registry（先只做 `blocks` + `transforms`）
- 在 `editor/preset` 中把对 `BlockManager` 的读写替换为 `engine.registry.blocks.*`
- 临时兼容：提供 `getDefaultEngine()`，并把旧 API 代理到默认 engine

### 5.3 Step 2：再落地 `schema`（把 React 从 core 拔掉）

- 把 `IBlock/IBlockData` 拆成两层类型：
  - `schema`：`BlockDefinition`（不含 `render`）
  - `react`：`BlockRenderer`（含 `render`）
- 把 `JsonToMjml` 等转换逻辑迁到 `schema`
- 让 `editor/preset` 改为依赖 `schema`（只拿类型/转换/树操作）

### 5.4 Step 3：把 block 渲染迁出 `core`

- 将 `core/src/blocks/**` 与 `core/src/components/**` 迁移到 `blocks-react`（或 `editor`）
- 以插件形式注册到 engine：`engine.use(standardBlocksPlugin())`

### 5.5 Step 4：extensions 更名为 preset

- 包名从 `@wa-dev/email-editor-extensions` 更名为 `@wa-dev/email-editor-preset`
- 旧包名保留兼容 re-export（主版本周期内）
- README 明确说明：这是"默认产品预设 UI"，而非"插件系统"

### 5.6 Step 5：Block 组件标准化（清理分散文件）

#### 目标
将分散在多处的 block 相关代码（schema、renderer、panel、jsx builder）统一到插件目录，遵循 4.5 节的标准化方案。

#### 执行顺序（按 block 类型逐个迁移）

**Phase 1：清理 JSX builder** — ✅ **已完成（2026-06）**

1. ~~分析 `mjml/jsx/*.tsx` 的使用情况~~ → 仅测试 + advanced 模板两处内部引用
2. 已删除整个 `mjml/jsx` 目录；`components` / `mjml` 命名空间仅 re-export core
3. 迁移指南：[`MJML_JSX_MIGRATION.md`](./MJML_JSX_MIGRATION.md)

**Phase 2：迁移属性面板到插件内（核心）**

按优先级迁移（建议顺序：Button → Text → Image → 其他）：

1. **为每个 block 新增 `panel.tsx`**
   ```typescript
   // plugins/standard/button/panel.tsx
   import React from 'react';
   import type { IButton } from './schema';
   import { AttributesPanelWrapper } from '@wa-dev/email-editor-preset';
   
   export const ButtonPanel: React.FC = () => {
     // 从 preset/AttributePanel/components/blocks/Button/index.tsx 迁移
     return <AttributesPanelWrapper>{/* ... */}</AttributesPanelWrapper>;
   };
   ```

2. **更新 `index.ts` 导出**
   ```typescript
   export { ButtonPanel } from './panel';
   ```

3. **更新 preset 的 AttributePanel 路由**
   ```typescript
   // preset/AttributePanel/index.tsx
   import { ButtonPanel } from '@wa-dev/email-editor-blocks-react/plugins/standard/button';
   
   const PANEL_MAP = {
     [BasicType.BUTTON]: ButtonPanel,
     // ...
   };
   ```

4. **删除旧的属性面板文件**
   ```bash
   rm -rf packages/email-editor-preset/src/AttributePanel/components/blocks/Button/
   ```

5. **测试**：确认属性编辑功能正常

**Phase 3：清理与验证**

1. 确认所有 block 都已迁移
2. `preset/AttributePanel/components/blocks/` 目录应为空（或仅保留通用组件）
3. 运行类型检查：`pnpm typecheck`
4. 运行测试：`pnpm test`

#### 验收标准

- [x] `mjml/jsx/*.tsx` 全部删除（见 `MJML_JSX_MIGRATION.md`）
- [ ] `preset/AttributePanel/components/blocks/` 目录为空（Button 已迁出，其余块待迁）
- [ ] 每个 block 插件目录包含：`schema.ts` + `renderer.tsx` + `panel.tsx` + `index.ts`（Button ✅）
- [ ] 所有 panel 通过 TypeScript 类型检查（强制导入 schema 类型）
- [ ] 属性编辑功能测试通过

#### 预计工作量

- 标准 blocks（15 个）：每个 0.5-1 小时 = 8-15 小时
- 高级 blocks（5 个）：每个 1-2 小时 = 5-10 小时
- 总计：**13-25 小时**

---

## 6. 明确的破坏性变更（对外行为）

- `@wa-dev/email-editor-core` 不再作为"万能入口"，将被拆分/弱化（可保留一段时间的 compat re-export，但不承诺长期存在）
- 原 `BlockManager` static 注册模式移除或仅保留 compat，并明确只影响默认 engine（不保证多实例隔离）
- 所有 block 渲染相关导出迁移位置变更（消费者需按新入口更新 import）
- `@wa-dev/email-editor-extensions` 更名为 `@wa-dev/email-editor-preset`（旧包名短期兼容）
- `@wa-dev/email-editor-blocks-react`：**移除 `mjml/jsx` 与 `components.Section` 等按块 JSX 导出**；改用 `MjmlBlock` 或 `*Definition.create()`（见 [`MJML_JSX_MIGRATION.md`](./MJML_JSX_MIGRATION.md)）

---

## 7. 验收标准（Definition of Done）

- **同页渲染两个 editor**：
  - editor A 使用 engine A，仅装载插件集合 A
  - editor B 使用 engine B，仅装载插件集合 B
  - 两边 block registry / transforms / 状态互不影响
- **schema 包**：
  - 不依赖 React/DOM（依赖树可验证）
  - Node 环境可跑关键转换/校验测试
- **engine 包**：
  - 无 static 全局注册中心（默认 engine 仅作为可选兼容入口）
  - 插件加载顺序可预测（依赖排序/冲突检测至少有基础实现）
- **插件开发规范遵守**：
  - 每个 block 的 schema + renderer 在同一个插件包内
  - renderer 通过 import 复用 schema 的类型（无重复定义）
  - 配对检查通过（engine.init() 无错误/警告）

---

## 8. 风险与对策（激进版必读）

- **迁移面较大**：先统一依赖入口与 exports，减少"本地与构建不一致"导致的返工
- **API 变更集中爆发**：用一次主版本升级承载；提供迁移指南与 codemod（可选）
- **插件边界不清**：先定义最小贡献点（blocks + transforms），再逐步把 UI 面板/toolbar 等纳入 manifest
- **类型同步问题**：通过强制 co-location + ESLint 规则 + TypeScript 类型检查三重保障

---

### Block 组件标准化前后对比（以 Button 为例）

#### 迁移前（分散结构）

```
packages/email-editor-blocks-react/src/
  ├── plugins/standard/button/
  │   ├── schema.ts           # 类型定义
  │   ├── renderer.tsx        # 渲染逻辑
  │   └── index.ts            # 导出
  │
  └── mjml/core/
      └── MjmlBlock.tsx       # ✅ 通用 JSX 入口（原 jsx 已删）

packages/email-editor-preset/src/
  └── AttributePanel/components/blocks/Button/
      └── index.tsx           # ❌ 属性面板（分离）
```

**问题**：
1. 修改 Button 需要跨 3 个目录
2. 属性面板与 schema 无类型约束（容易不同步）
3. ~~JSX builder~~ 已删除，由 `MjmlBlock` 替代

---

#### 迁移后（内聚结构）

```
packages/email-editor-blocks-react/src/plugins/standard/button/
  ├── schema.ts           # 类型定义 + 默认值
  ├── renderer.tsx        # MJML 渲染
  ├── panel.tsx           # ✅ 属性面板（从 preset 迁移）
  ├── index.ts            # 统一导出
  └── README.md           # 可选：使用说明

packages/email-editor-preset/src/AttributePanel/
  └── index.tsx           # ✅ 仅保留路由逻辑（< 50 行）
```

**优势**：
1. 所有 Button 相关代码在一个目录
2. panel 通过 TypeScript 强制复用 schema 类型
3. ~~移除冗余的 JSX builder~~（已完成）

---

#### 代码示例对比

**迁移前：属性面板无类型约束**

```typescript
// preset/AttributePanel/components/blocks/Button/index.tsx
export function Button() {
  const { focusIdx } = useFocusIdx();
  
  return (
    <AttributesPanelWrapper>
      {/* ❌ 字段名是硬编码的字符串，容易与 schema 不一致 */}
      <TextField 
        label="内容"
        name={`${focusIdx}.data.value.content`}
      />
      <Link />
      <BackgroundColor title="按钮颜色" />
    </AttributesPanelWrapper>
  );
}
```

**迁移后：类型强制约束**

```typescript
// plugins/standard/button/panel.tsx
import type { IButton } from './schema';

interface ButtonPanelProps {
  focusIdx: string;
  data: IButton;  // ✅ 强类型约束
  onChange: (data: IButton) => void;
}

export const ButtonPanel: React.FC<ButtonPanelProps> = ({ focusIdx, data, onChange }) => {
  return (
    <AttributesPanelWrapper>
      {/* ✅ 如果 schema 改了字段名，这里会报类型错误 */}
      <TextField 
        label="内容"
        value={data.data.value.content}
        onChange={(content) => onChange({
          ...data,
          data: { ...data.data, value: { content } }
        })}
      />
      <Link value={data.attributes.href} />
      <BackgroundColor value={data.attributes['background-color']} />
    </AttributesPanelWrapper>
  );
};
```

---

#### 使用方式对比

**迁移前：分散导入**

```typescript
// 需要从多个包导入
import { Button } from '@wa-dev/email-editor-blocks-react';
import { Button as ButtonPanel } from '@wa-dev/email-editor-preset/AttributePanel/components/blocks';
import MjmlBlock, { BasicType } from '@wa-dev/email-editor-blocks-react';
// 自定义块 render: <MjmlBlock type={BasicType.BUTTON} ... />
```

**迁移后：统一导入**

```typescript
// 从一个插件导入所有内容
import { 
  Button,           // 插件定义
  IButton,          // 类型
  buttonDefinition, // schema
  ButtonPanel       // 属性面板
} from '@wa-dev/email-editor-blocks-react/plugins/standard/button';
```

---

## 附录：核心文件迁移映射（参考）

### 从 `email-editor-core` 迁出的文件

#### 迁移到 `email-editor-schema`
- `src/typings/index.ts`（`IBlockData` 等，去除 `ReactNode`）
- `src/utils/JsonToMjml.tsx` → `JsonToMjml.ts`（改为纯函数）
- `src/utils/block.ts`（树操作、idx 工具）
- `src/utils/isValidBlockData.ts`
- `src/utils/mergeBlock.ts`
- `src/utils/createBlock.ts` / `createBlockDataByType.ts`
- `src/constants.ts`（`BasicType`/`AdvancedType` 等）

#### 迁移到 `email-editor-engine`
- `src/utils/BlockManager.ts` → 改为 `registry.blocks`（实例方法）
- `src/utils/ImageManager.ts` → `services.image`
- `src/utils/TemplateEngineManager.tsx` → `services.template`
- `src/utils/I18nManager.tsx` → `services.i18n`

#### 迁移到 `email-editor-blocks-react`（或 `editor`）
- `src/blocks/**/*.tsx`（所有 block 定义）
- `src/components/**/*.tsx`（所有 React 组件）

---

### Block 组件迁移清单

#### 标准 Blocks（15 个）

| Block 类型 | 属性面板 | JSX Builder | 优先级 | 预计工时 |
|-----------|---------|------------|--------|---------|
| Button | ✅ 存在 | ✅ 存在 | P0（示范） | 1h |
| Text | ✅ 存在 | ✅ 存在 | P0 | 1h |
| Image | ✅ 存在 | ✅ 存在 | P0 | 1h |
| Divider | ✅ 存在 | ✅ 存在 | P1 | 0.5h |
| Spacer | ✅ 存在 | ✅ 存在 | P1 | 0.5h |
| Page | ✅ 存在 | ✅ 存在 | P1 | 1h |
| Section | ✅ 存在 | ✅ 存在 | P1 | 1h |
| Column | ✅ 存在 | ✅ 存在 | P1 | 1h |
| Group | ✅ 存在 | ✅ 存在 | P1 | 1h |
| Wrapper | ✅ 存在 | ✅ 存在 | P1 | 1h |
| Raw | ✅ 存在 | ✅ 存在 | P2 | 0.5h |
| Carousel | ✅ 存在 | ✅ 存在 | P2 | 1.5h |
| Hero | ✅ 存在 | ✅ 存在 | P2 | 1.5h |
| Navbar | ✅ 存在 | ✅ 存在 | P2 | 1.5h |
| Social | ✅ 存在 | ✅ 存在 | P2 | 1.5h |

#### 高级 Blocks（6 个）

| Block 类型 | 属性面板 | JSX Builder | 优先级 | 预计工时 |
|-----------|---------|------------|--------|---------|
| Accordion | ✅ 存在 | ✅ 存在 | P1 | 2h |
| AccordionElement | ✅ 存在 | ✅ 存在 | P1 | 1h |
| AccordionTitle | ✅ 存在 | ✅ 存在 | P1 | 0.5h |
| AccordionText | ✅ 存在 | ✅ 存在 | P1 | 0.5h |
| Table | ✅ 存在 | ✅ 存在 | P1 | 1.5h |
| AdvancedTable | ✅ 存在 | ❌ 无 | P2 | 1h |
| Template | ❌ 无 | ✅ 存在 | P2 | 0.5h |

#### 统计

- **总数**：22 个 blocks
- **有属性面板**：21 个
- **有 JSX Builder**：21 个
- **预计总工时**：22-25 小时

#### 建议迁移顺序

**Phase 1：核心 Blocks（P0，优先完成）**
1. Button（作为示范）
2. Text
3. Image

**Phase 2：布局 Blocks（P1）**
4. Section
5. Column
6. Group
7. Wrapper
8. Page
9. Accordion（+ Element/Title/Text）
10. Table

**Phase 3：装饰 Blocks（P2）**
11. Divider
12. Spacer
13. Hero
14. Carousel
15. Navbar
16. Social
17. Raw
18. AdvancedTable
19. Template

---

**后续可按此文档逐步执行改造，每完成一步可更新本文档的进度标记。**
