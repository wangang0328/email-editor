# 多语言词条脚本说明

对接博客中台 `i18n/client/*`：本地 `locales/*.json` ↔ 服务端词条库。

> 本仓库词条 **key = 中文原文**（如 `"撤销"`）。`entryId = md5(namespace::key)`（无 context）或 `md5(namespace::context::key)`（有 Lingui msgctxt）；推送默认 **只传 zh-CN + draft**。其它语言在中台校准 / AI 译 → **审核通过 → 上线** 后，再用 `i18n:pull-published` 拉回。

相关设计见博客平台：`apps/docs/多语言服务/多语言词条服务设计方案.md`。

---

## 命令一览（方向一眼能看懂）

| 命令 | 方向 | 做什么 |
|------|------|--------|
| `i18n:collect-keys` | 本地 | extract → 更新 PO / 镜像 locales |
| `i18n:diff-refs` | 本地 vs 中台 | 对比本仓库在用 key 与远端 refs |
| `i18n:report-refs` | 本地 → 中台 | 上报「本项目在用哪些 key」 |
| `i18n:push-draft` | 本地 → 中台 | 推 **zh-CN draft**（默认不上线） |
| `i18n:pull-published` | 中台 → 本地 | 只拉已 **online** 译文写回 PO |
| `i18n:upload-draft` | 本地 → 中台 | 一条龙：collect → diff → report → **push-draft**（可选再 pull） |

> `upload-draft` **不是**双向同步；默认只上送草稿。旧名 `i18n:sync` / `collect` / `push` / `pull` 等仍可用作别名。已删除含义不清的 `i18n:all`。

---

## 一条龙（推荐）

```bash
pnpm i18n:upload-draft
```

流程：

1. **collect-keys** — `lingui extract` → 把 msgid 同步进 `locales/*.json`
2. **diff-refs** — 相对远端 active refs 打印新增/减少
3. **report-refs** — 上报本项目在用的 keys
4. **push-draft** — 只推 **zh-CN draft**（默认仅新增 key；**默认不上线**，便于中台校准）
5. （可选）**pull-published** — `--with-pull` 时串联；只拉已 online 译文

常用变体：

```bash
pnpm i18n:upload-draft -- --dry-run              # 不写远端
pnpm i18n:upload-draft -- --skip-extract         # 跳过 lingui，只用现有 po
pnpm i18n:upload-draft -- --skip-push            # 只收集 + diff + 上报引用
pnpm i18n:upload-draft -- --full-push            # 推全量中文（默认 only-added）
pnpm i18n:upload-draft -- --all-langs            # 连同本地其它语言一起推（少用）
pnpm i18n:upload-draft -- --with-pull --all      # 上推后再拉已发布（刚 push 的 draft 不会进 bundle）
```

---

## 目录

| 文件 | 说明 |
|------|------|
| `shared.ts` | 配置、locale 读写、远端 refs、diff、HTTP |
| `collect.ts` | 收集：extract + 同步 locales |
| `ref-diff.ts` | diff：远端 refs vs **zh-Hans PO msgid** |
| `ref-sync.ts` | 上报引用清单 |
| `push.ts` | 推词条到 draft（默认仅 zh-CN） |
| `pull.ts` | 拉取已发布 → **写 PO**（+ json 镜像）→ compile |
| `sync.ts` | 一条龙入口（`i18n:upload-draft`）：collect → diff → report → push-draft（可选 `--with-pull`） |

本地 locale：`packages/email-editor-localization/locales/`。

---

## 环境变量

复制仓库根目录 `.env.example` → `.env`：

```env
I18N_API_BASE=http://localhost:8000/admin-api/v1
I18N_PROJECT=email-editor
I18N_NAMESPACE=email-editor
I18N_API_KEY=
I18N_PUSHER=zhangsan
I18N_CLIENT_VERSION=
```

| 变量 | 默认 | 说明 |
|------|------|------|
| `I18N_API_BASE` | `http://localhost:8000/admin-api/v1` | Nest 网关前缀 |
| `I18N_PROJECT` | `email-editor` | 中台项目 code |
| `I18N_NAMESPACE` | `email-editor` | 词条命名空间 |
| `I18N_API_KEY` | 空 | Header `X-I18n-Api-Key` |
| `I18N_PUSHER` | 系统用户名 | 推送人 |
| `I18N_CLIENT_VERSION` | 空 | 可选 |

语言码：`zh-Hans`→`zh-CN`，`zh-Hant`→`zh-TW`，`en`→`en-US`，`ja`→`ja-JP`，`ko`→`ko-KR`，`it`→`it-IT`，`tr`→`tr-TR`。

---

## 分步命令

```bash
pnpm i18n:collect-keys              # lingui extract → locales
pnpm i18n:diff-refs                 # 相对远端 refs 做 diff
pnpm i18n:report-refs             # 上报引用
pnpm i18n:push-draft                 # 默认只推 zh-CN
pnpm i18n:pull-published                 # 拉已发布译文
```

```bash
pnpm i18n:collect-keys -- --skip-extract
pnpm i18n:diff-refs -- --json
pnpm i18n:diff-refs -- --baseline=local
pnpm i18n:report-refs -- --dry-run
pnpm i18n:push-draft -- --only-added --dry-run
pnpm i18n:push-draft -- --all-langs          # 少用
pnpm i18n:pull-published -- --all --merge
```

---

## Diff 基线

默认 `baseline=auto`：远端 `GET /i18n/client/refs` → 本地快照 → empty（首次全量）。

| `--baseline` | 行为 |
|--------------|------|
| `auto`（默认） | 远端 → 快照 → empty |
| `remote` | 必须远端，失败退出 |
| `local` | 仅本地 `.i18n-ref-snapshot.json` |

`i18n:pull-published` 拉的是**已发布译文**；diff 拉的是**引用 keys**，不是同一个接口。

---

## 推荐工作流

### 日常改文案

```bash
pnpm i18n:upload-draft
```

默认写入中台 **draft**，不会立刻上线（`I18N_PUBLISH_REQUIRE_APPROVAL` 默认开启）：有改动先校准，再批量通过 → 上线。

中台审核 → AI 译其它语言 → **publish** 后，把译文落回仓库：

```bash
pnpm i18n:pull-published -- --all                 # 按本地 msgid 按需拉（hash/key）
pnpm i18n:pull-published -- --all --mode delta    # 增量：新 key + 仍是中文占位的 key
pnpm i18n:pull-published -- --lang en             # 只拉一种
```

> **写 PO，不是只写 JSON。** 编辑器 `t()` 走 Lingui：`messages.po` → compile → `messages.mjs`（`LanguageProvider` 加载）。`locales/*.json` 只作镜像 / email-app 静态兜底与按需 POST 的 key 清单。
### 首次接入

```bash
pnpm i18n:upload-draft -- --full-push    # collect + 全量 ref + 全量中文
# 或
pnpm i18n:report-refs -- --full
pnpm i18n:push-draft                   # 全量 zh-CN
```

### 只看 diff / 只上报

```bash
pnpm i18n:diff-refs
pnpm i18n:report-refs
pnpm i18n:upload-draft -- --skip-push
```

---

## 各命令参数

### `i18n:collect-keys`

| 参数 | 说明 |
|------|------|
| `--skip-extract` | 不跑 lingui，直接用现有 `zh-Hans/messages.po` |

`lingui extract` 更新各语言 PO；再把 zh-Hans msgid 镜像到 `zh-Hans.json`（给 push 读）。**diff / ref-sync 直接读 PO，不依赖 json。**

### `i18n:diff-refs`

本地侧取自 **`lingui/zh-Hans/messages.po` 的 msgid**（不是 json）。基线默认远端 `GET /i18n/client/refs`。

| 参数 | 说明 |
|------|------|
| `--json` | JSON 输出 |
| `--baseline=auto\|remote\|local` | 基线 |
| `--local` / `--remote` | 简写 |

### `i18n:report-refs`

| 参数 | 说明 |
|------|------|
| `--full` | 全量 keys 上报 |
| `--dry-run` | 只打印 |
| `--no-create` | 新增 key 不自动建空词条 |
| `--baseline=...` | 同 diff |

### `i18n:push-draft`

| 参数 | 说明 |
|------|------|
| （默认） | 只推 `zh-CN`，且 **only-added**（相对远端 refs 的新增） |
| `--full` | 全量推中文 |
| `--all-langs` | 推本地全部已有译文 |
| `--publish` | 直接上线（慎用） |
| `--no-skip` | 覆盖已有人工译（其它语言） |
| `--dry-run` | 只打印 |

服务端：同一中文 key 且 draft 未变 → `skipped`，**不改审核状态、不写历史**。

### `i18n:pull-published`

按需拉取：**以本地 `zh-Hans` msgid（含 msgctxt → catalog key）为清单**，`POST /i18n/client/bundle` 传 `hashes`（优先）、无 map 时传 `keys`（纯 msgid）与 `items: { key, context }[]`（有 msgctxt 时）。  
响应带回 `keyHashes` → 写入 `.i18n-key-map.json`；各语言已拉 hash → `.i18n-pull-snapshot.json`。  
`project` 仅鉴权/日志，**不决定词条归属**。

默认写入 **`lingui/{lang}/messages.po`**（有 context 时恢复 `msgctxt`），并镜像 `locales/{lang}.json`，最后 `lingui compile`。

| 参数 | 说明 |
|------|------|
| `--lang <local>` | 默认 `zh-Hans` |
| `--all` | 全部已有 PO/json 的语言 |
| `--mode full` | 默认：拉当前全部 msgid；**一次请求带上队列内全部语言** |
| `--mode delta` / `--incremental` | 跳过「已 pull 且本地已有非中文译文」；**新 key** 与 **仍为空/等于 msgid（中文占位）** 的会重拉 |
| `--legacy-ns` | 旧行为：按语言多次 GET namespaces 全量 |
| `--replace` | 不合并，PO/json 只保留远端 keys（慎用；默认 merge） |
| `--json-only` | 只写 json（不推荐） |
| `--skip-json` | 只写 PO |
| `--skip-compile` | 不跑 lingui compile |
| `--dry-run` | 不写文件 |

```bash
pnpm i18n:pull-published -- --all                 # 全量按需（带 hash/key）
pnpm i18n:pull-published -- --all --mode delta    # 增量：只拉新 msgid
pnpm i18n:pull-published -- --lang en --mode full # 刷新英文（含已有 key 的新译文）
```

> **已译好的旧词改译后，delta 不会刷新。** 用 `--mode full`。中文占位尚未换成译文的，delta 会继续重试。

### `i18n:upload-draft`

| 参数 | 说明 |
|------|------|
| `--dry-run` | 传给 ref-sync / push / pull |
| `--skip-extract` | 传给 collect |
| `--skip-push` | 跳过 push |
| `--full-push` | 推全量中文（否则 only-added） |
| `--full` | ref-sync 全量上报 |
| `--all-langs` | push 全部语言 |
| `--publish` / `--no-skip` | 传给 push（`--publish` 跳过校准，慎用） |
| `--with-pull` | push 后再 pull（仅 online；可加 `--all` / `--mode` / `--lang`） |

---

## 一词多义 context

同一中文 msgid 在不同 UI 位置含义不同时，用 Lingui **`msgctxt`** 区分，**不要把语境拼进中文 msgid**。

```tsx
// ✅
t({ id: '确定', message: '确定', context: 'dialog.confirm' })
t({ id: '确定', message: '确定', context: 'form.submit' })

// ❌ 不要写成「确定(对话框)」「确定_submit」等拼接 key
```

约定：

| 层 | 行为 |
|----|------|
| 源码 / PO | `msgctxt` + `msgid`；msgid 仍是纯中文 |
| 本地扁平键 | `context + "\\u0004" + msgid`（gettext catalog 惯例；json / key-map 同此） |
| 中台 | 独立 `context` 字段；`entryId = md5(namespace::context::key)`（无 context 时仍为 `md5(namespace::key)`） |
| push / ref-sync / pull | 无 context → `keys: string[]`；有 context → 额外传 `items: { key, context }[]` |
| pull 写回 | 识别 catalog 键中的 `\\u0004`，恢复 `msgctxt` 行后再 `msgid` / `msgstr` |

`i18n:diff-refs` / `ref-sync` 的本地真相源仍是 **zh-Hans PO**（含 msgctxt）；快照里存的是 catalog key。

---

## ICU 单复数

需要按数量变化的文案，**整条用一条 ICU MessageFormat 模板**（Lingui / FormatJS），不要拆成多条 msgid：

```ts
t('{count, plural, =0 {暂无文件} one {# 个文件} other {# 个文件}}', { count })
```

约定：

- **API / 运行时只传数字**（如 `count: 3`），由 ICU 引擎选分支；不要在业务里自己拼「3 个文件」。
- 中台存的是**整段 ICU 源文/译文**；AI 译其它语言时会做 **ICU 结构校验**（花括号配对、占位符名、`plural` 是否保留等），不通过则不应上线。
- `msgid` 仍是中文侧模板字符串；若一词多义，继续用 `msgctxt`，不要把 context 写进 ICU 正文。

---

## 与其它脚本

| 脚本 | 职责 |
|------|------|
| `pnpm translate` | 本地 Google 译 `locales`（旧路径，不经中台） |
| `pnpm i18n:extract` / `compile` | Lingui；`collect` 会调 extract |
| `scripts/i18n/*` | 中台引用 + 中文上推 / 已发布下拉 |

---

## 常见问题

**Q: 为什么只推中文？**  
key = 中文 msgid；`entryId = md5(namespace::key)`（有 msgctxt 时 `md5(namespace::context::key)`）；其它语言在中台改 draft / AI 译后 publish，避免本地多语言和中台打架。

**Q: 为什么默认不上线？**  
有改动需要中台校准 / 审核；`publish=false` + 审核门禁是刻意设计，不是缺陷。

**Q: push 后客户端 / pull 仍 keys=0？**  
默认写 **draft**；需中台 **通过 → 上线** 后 `POST /i18n/client/bundle` 才有 online 词条。

**Q: ref-sync 减少 key 会删词条吗？**  
不会，只改项目引用状态。

**Q: project 不存在 / API Key？**  
确认中台已有 `email-editor`；开发期可关 `I18N_REQUIRE_API_KEY`。

**Q: 运行时怎么拉？**  
`email-app` 用静态 `zh-Hans.json` 的 keys，`POST /i18n/client/bundle` 按需拉取（与脚本同模型）；失败回落缓存 / 静态包。
