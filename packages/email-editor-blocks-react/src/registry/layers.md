# 块模块分层（避免循环依赖）

## 层次

| 层 | 目录 / 入口 | 职责 |
|----|-------------|------|
| 定义 | `plugins/standard/*`, `plugins/advanced/*` | `defineBlock`、schema、render；**不得**在模块顶层 import `blockRegistry` / `bootstrap` |
| 组合 | `plugins/standard/standardBaseBlocks.ts` | 导出 `type → IBlock` 映射，供注册与外部使用 |
| 注册 | `plugins/registerBuiltInBlocks.ts` | 在插件 `setup()` 中写入 engine registry（组合根） |
| 运行时 | `blockRegistry.ts`, `bootstrap/ensureDefaultEngineBlocks.ts` | 应用与编辑器侧 `getBlockByType`、懒注册 |
| 渲染查找 | `mjml/resolveRenderBlock.ts` | MJML 树渲染时查块；**仅**依赖 `getDefaultEngine`，不触发 bootstrap |

## 曾经的循环

```
standardBaseBlocks → Page → BlockRenderer → blockRegistry
  → ensureDefaultEngineBlocks → standardBlocksPlugin → standardBlocks → standardBaseBlocks
```

## 原则

- **初始化阶段**：块定义 → 组合映射，单向依赖。
- **注册阶段**：仅在插件 `setup()`（或显式 `ensureDefaultEngineBlocks()`）合并进 registry。
- **使用阶段**：通过 registry 查块；MJML 渲染用 `resolveRenderBlock`，应用代码用 `getBlockByType`。

这样 `standardBlocksPlugin` 可保持普通静态 `import`，无需 `require` 延迟加载。

