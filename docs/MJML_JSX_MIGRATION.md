# `mjml/jsx` 移除迁移说明

> **状态：已完成（2026-06）**  
> 目录 `packages/email-editor-blocks-react/src/mjml/jsx`（及过渡期 `jsx-expired`）已删除。自定义块与内部代码已迁到 **`MjmlBlock`**。

---

## 变更摘要

| 项目 | 说明 |
|------|------|
| 删除 | `mjml/jsx/*.tsx`（约 20 个按块拆分的 JSX 包装组件） |
| 保留 | `mjml/core/MjmlBlock.tsx`、`BlockRenderer`、`BasicBlock` |
| 对外 | `export * as mjml` / `export * as components` 仅含 **core**，不再导出 `Section`、`Button` 等 |
| Breaking | 依赖 `components.Button`、`import from '.../mjml/jsx'` 的代码需改写 |

---

## 为什么要删

- 每个 `jsx/Button.tsx` 等文件只是 `MjmlBlock` 的薄包装，最终仍调用 `plugins/standard/*/renderer.tsx`。
- 与 `buttonDefinition.create()` 功能重复，维护成本高、命名易混淆。
- 主路径（画布、导出）只使用 JSON + `block.render()`，从不经过 jsx 目录。

详见 [`BUTTON_BLOCK_ARCHITECTURE.md`](./BUTTON_BLOCK_ARCHITECTURE.md)。

---

## 迁移对照

### 自定义块 `render` 内拼子树

**之前：**

```tsx
import { Section, Column, Button } from '@wa-dev/email-editor-blocks-react';
// 或
import { Section, Column, Button } from '@wa-dev/email-editor-blocks-react/mjml/jsx';

<Section padding="20px">
  <Column>
    <Button href="#" background-color="#414141">
      {buttonText}
    </Button>
  </Column>
</Section>
```

**之后：**

```tsx
import MjmlBlock, { BasicType } from '@wa-dev/email-editor-blocks-react';

<MjmlBlock type={BasicType.SECTION} padding="20px">
  <MjmlBlock type={BasicType.COLUMN}>
    <MjmlBlock
      type={BasicType.BUTTON}
      href="#"
      background-color="#414141"
    >
      {buttonText}
    </MjmlBlock>
  </MjmlBlock>
</MjmlBlock>
```

属性可写在组件 props 上（与旧 jsx 相同），也可使用显式 `attributes`：

```tsx
<MjmlBlock
  type={BasicType.BUTTON}
  attributes={{ href: '#', 'background-color': '#414141' }}
>
  {buttonText}
</MjmlBlock>
```

### 使用 `components` 命名空间

**之前：**

```tsx
import { components, createCustomBlock } from '@wa-dev/email-editor-blocks-react';
const { Section, Column, Button } = components;
```

**之后：**

```tsx
import MjmlBlock, { BasicType, createCustomBlock } from '@wa-dev/email-editor-blocks-react';
// components 别名仍存在但仅 re-export mjml core，无 Section/Button
```

### 不用 JSX、纯数据（推荐复杂结构）

```tsx
import {
  BlockRenderer,
  buttonDefinition,
  sectionDefinition,
  columnDefinition,
} from '@wa-dev/email-editor-blocks-react';

<BlockRenderer
  data={sectionDefinition.create({
    attributes: { padding: '20px' },
    children: [
      columnDefinition.create({
        children: [
          buttonDefinition.create({
            data: { value: { content: buttonText } },
            attributes: { href: '#', 'background-color': '#414141' },
          }),
        ],
      }),
    ],
  })}
/>
```

### 模板引擎 / Raw 块

**之前：** `<Raw>{liquid}</Raw>`  
**之后：** `<MjmlBlock type={BasicType.RAW}>{liquid}</MjmlBlock>`

---

## 仓库内已迁移文件

| 文件 | 改动 |
|------|------|
| `plugins/advanced/generateAdvancedContentBlock.tsx` | `Section`/`Column` → `MjmlBlock` |
| `utils/TemplateEngineManager.tsx` | `Raw` → `MjmlBlock` + `BasicType.RAW` |
| `__tests__/createCustomBlock.test.tsx` | 同上 |
| `Custom block.md` | 文档示例更新 |

---

## 对外升级检查清单

- [ ] 搜索 `mjml/jsx`、`components.Section`、`components.Button` 等引用
- [ ] 改为 `MjmlBlock` + `BasicType.*` 或 `*Definition.create()`
- [ ] 跑 `JsonToMjml` / 自定义块快照测试
- [ ] 升级 `@wa-dev/email-editor-blocks-react` 主版本（含 Breaking Change 说明）

---

## 相关文档

- [Button 块架构](./BUTTON_BLOCK_ARCHITECTURE.md)
- [Schema 引擎重构提案](./SCHEMA_ENGINE_REFACTOR_PROPOSAL.md) §4.5、§5.6 Phase 1
