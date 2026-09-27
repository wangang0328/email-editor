# Changesets

本仓库用 Changesets 管理 `@wa-dev/email-editor-*` 的版本与发布。

## 日常开发

改完代码后记录一次变更意图：

```bash
pnpm changeset
```

按提示选择包、semver 类型（patch / minor / major）并填写说明。会在 `.changeset/` 生成一个 markdown 文件，请一并提交。

## 发版

```bash
# 1. 根据 pending changesets  bump 版本并写 CHANGELOG
pnpm version-packages

# 2. 更新 lockfile
pnpm install

# 3. 构建
pnpm run build

# 4. 发布到 npm（需已登录，且对 @wa-dev 有权限）
pnpm release
```

也可一步：`pnpm run release:ci`（version → install → build → publish）。

所有可发布包在 `fixed` 组中，同一次发版会升到相同版本号。
