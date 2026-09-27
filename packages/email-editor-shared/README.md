# @wa-dev/email-editor-shared

邮件编辑器 monorepo 的**共享层**：放跨包复用的**纯数据与无框架工具**，避免在 `email-editor-core`、`email-editor-editor`、`email-editor-extensions` 之间复制粘贴。

---

## 功能定位

| 适合放在本包 | 说明 |
|-------------|------|
| 图片 / 资源的 **URL、base64、路径常量** | 单一数据源，供各包 `ImageManager.add` 或直接使用 |
| **与 React / MJML / 编辑器 UI 无关** 的工具函数 | 例如字符串、校验、轻量数据结构转换 |
| **类型定义**（若多个包需要且不宜放在 core） | 保持无运行时依赖或仅依赖其他 shared 子模块 |
| 小型 **JSON / 配置片段** | 如国际化 key 列表、与业务弱耦合的枚举映射 |

本包**不是**另一个 `core`：不包含块渲染、Editor Provider、React 组件或 `ImageManager` 实现（注册表仍由 `@wa-dev/email-editor-core` 持有并 `add` 本包导出的 map 即可）。

---

## 约束（必须遵守）

1. **依赖方向**  
   - 本包 **不得** 依赖 `@wa-dev/email-editor-core`、`@wa-dev/email-editor-editor`、`@wa-dev/email-editor-extensions`。  
   - 否则易产生循环依赖，并违背「最底层共享」的定位。

2. **技术栈**  
   - **禁止** 依赖 `react`、`react-dom`、MJML 相关包、编辑器 UI 库。  
   - 仅使用 TypeScript 标准能力 + 允许的极轻量依赖（若有，需在 PR 中说明理由）。

3. **资源形式**  
   - **写入最终邮件 HTML / `mj-image` 等** 的资源：优先 **HTTPS URL**；慎用 **data URI**（体积与客户端兼容性）。  
   - **仅编辑器壳子 UI**（块面板缩略图、表单装饰等）：可用小图 base64 或构建期 `import`，在代码与 README 中标注用途。

4. **API 稳定性**  
   - 对外导出的常量名、函数签名视为 **公共 API**；破坏性变更应 semver  MINOR/MAJOR 并更新 changelog。

5. **体积**  
   - 避免在本包内堆积大体积 base64；大图优先外链或单独静态资源包 / CDN。

---

## 使用方式（其他包）

在目标包的 `package.json` 中增加：

```json
"dependencies": {
  "@wa-dev/email-editor-shared": "workspace:*"
}
```

从源码导入（构建前需先构建 shared）：

```ts
import { EMAIL_EDITOR_SHARED_VERSION } from '@wa-dev/email-editor-shared';
```

> 将各包中重复的 `getImg` / 图片 map 迁到本包时：在本包导出 **纯对象**；由 `@wa-dev/email-editor-core` 在合适时机 `ImageManager.add(importedMap)`，避免本包引用 `ImageManager`。

---

## 构建

```bash
cd packages/email-editor-shared
pnpm install
pnpm run build
```

产物输出到 `lib/`，发布字段 `files` 仅包含 `lib` 与本 README。

---

## 与根仓库脚本的关系

仓库根目录 `package.json` 的 `build` 已包含 `build:shared`，会在 `build:core` 之前执行。单独开发本包时仍可在包目录执行 `pnpm run build`。

---

## 许可

MIT（与 monorepo 其他包一致）。
