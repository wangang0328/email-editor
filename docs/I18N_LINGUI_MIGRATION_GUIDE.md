# 国际化迁移指南：从自定义 I18nManager 到 LinguiJS

## 概述

本文档详细说明将项目从当前自定义 `I18nManager` 迁移到 LinguiJS 的完整步骤。

**推荐迁移路径：英文 key → 中文 key → LinguiJS**

### ✅ 迁移进度 (2026-03-31 已完成)

| 步骤 | 状态 | 说明 |
|------|------|------|
| 第零步：英文 key → 中文 key | ✅ 已完成 | 104 个文件，388 处替换 |
| 升级 Vite 到 v5 | ✅ 已完成 | v2.9.18 → v5.4.21 |
| 升级 React 插件 | ✅ 已完成 | @vitejs/plugin-react-refresh → @vitejs/plugin-react@4 |
| 配置 LinguiJS Babel 插件 | ✅ 已完成 | @lingui/babel-plugin-lingui-macro |
| 创建 lingui.config.ts | ✅ 已完成 | 基础配置就绪 |
| JSON → PO 转换 | ✅ 已完成 | 237 条翻译已转换 |
| t() → t\`\` 宏替换 | ✅ 已完成 | 106 个文件已修改 |
| LanguageProvider 集成 | ✅ 已完成 | 使用 @lingui/react I18nProvider |
| lingui compile | ✅ 已完成 | 7 个语言编译成功 |
| **完整迁移验证** | ✅ 已完成 | 中英文切换正常 |

### 当前状态 (已迁移)

| 项目 | 说明 |
|------|------|
| 当前方案 | **LinguiJS** (@lingui/react + @lingui/macro) |
| 翻译文件 | `packages/email-editor-localization/lingui/{locale}/messages.po` |
| 编译输出 | `packages/email-editor-localization/lingui/{locale}/messages.mjs` |
| 支持语言 | zh-Hans, zh-Hant, en, ja, ko, it, tr |
| 文案数量 | ~237 条 |
| Key 策略 | **中文原文作为 key** |
| 语法 | `t\`中文文本\`` (模板字符串宏) |

---

## 零、预备步骤：英文 key 替换为中文 key ✅ 已完成

> **此步骤已于 2026-03-31 完成。** 代码中所有 `t('English')` 调用已替换为 `t('中文')`。

### 0.1 为什么先替换成中文？

| 收益 | 说明 |
|------|------|
| **代码可读性** | 中文开发者直接看懂 `t('字号')`，无需查表 |
| **减少步骤** | 英文→中文→LinguiJS 变为 中文→LinguiJS |
| **key 稳定** | 中文措辞变化频率低 |
| **保持兼容** | 现有 `t()` 函数结构不变 |

### 0.2 替换前后对比

**替换前：**
```tsx
// 代码
t('Font size')

// en.json
{ "Font size": "Font size" }

// zh-Hans.json
{ "Font size": "字号" }
```

**替换后：**
```tsx
// 代码
t('字号')

// zh-Hans.json (作为基准)
{ "字号": "字号" }

// en.json
{ "字号": "Font size" }
```

### 0.3 自动替换脚本

创建 `scripts/replace-i18n-keys.ts`:

```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

// 读取中文翻译表（英文 key -> 中文 value）
const zhHansPath = path.join(
  process.cwd(),
  'packages/email-editor-localization/locales/zh-Hans.json'
);
const zhHans: Record<string, string> = fs.readJsonSync(zhHansPath);

// 构建替换映射：英文 -> 中文
const replaceMap: Record<string, string> = {};
for (const [enKey, zhValue] of Object.entries(zhHans)) {
  // 跳过相同的（如 URL）
  if (enKey !== zhValue) {
    replaceMap[enKey] = zhValue;
  }
}

console.log(`找到 ${Object.keys(replaceMap).length} 个需要替换的 key`);

// 查找所有 tsx/ts 文件
async function main() {
  const files = await glob('packages/**/src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.d.ts'],
  });

  let totalReplacements = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;
    let fileReplacements = 0;

    for (const [enKey, zhValue] of Object.entries(replaceMap)) {
      // 匹配 t('English key') 或 t("English key")
      const patterns = [
        new RegExp(`t\\('${escapeRegex(enKey)}'\\)`, 'g'),
        new RegExp(`t\\("${escapeRegex(enKey)}"\\)`, 'g'),
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, `t('${zhValue}')`);
          modified = true;
          fileReplacements += matches.length;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`✓ ${file} (${fileReplacements} 处替换)`);
      totalReplacements += fileReplacements;
    }
  }

  console.log(`\n总计替换 ${totalReplacements} 处`);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch(console.error);
```

### 0.4 更新 locale JSON 文件

创建 `scripts/flip-locale-keys.ts`:

```typescript
import * as fs from 'fs-extra';
import * as path from 'path';

const localesDir = path.join(
  process.cwd(),
  'packages/email-editor-localization/locales'
);

// 读取现有翻译
const zhHans: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'zh-Hans.json')
);
const en: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'en.json')
);
const zhHant: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'zh-Hant.json')
);
const ja: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'ja.json')
);
const ko: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'ko.json')
);
const it: Record<string, string> = fs.readJsonSync(
  path.join(localesDir, 'it.json')
);

// 创建新的 locale 文件（以中文为 key）
const newZhHans: Record<string, string> = {};
const newEn: Record<string, string> = {};
const newZhHant: Record<string, string> = {};
const newJa: Record<string, string> = {};
const newKo: Record<string, string> = {};
const newIt: Record<string, string> = {};

for (const [enKey, zhValue] of Object.entries(zhHans)) {
  const chineseKey = zhValue; // 中文作为新 key

  newZhHans[chineseKey] = zhValue;
  newEn[chineseKey] = en[enKey] || enKey;
  newZhHant[chineseKey] = zhHant[enKey] || zhValue;
  newJa[chineseKey] = ja[enKey] || zhValue;
  newKo[chineseKey] = ko[enKey] || zhValue;
  newIt[chineseKey] = it[enKey] || zhValue;
}

// 写入新文件
fs.writeJsonSync(path.join(localesDir, 'zh-Hans.json'), newZhHans, { spaces: 2 });
fs.writeJsonSync(path.join(localesDir, 'en.json'), newEn, { spaces: 2 });
fs.writeJsonSync(path.join(localesDir, 'zh-Hant.json'), newZhHant, { spaces: 2 });
fs.writeJsonSync(path.join(localesDir, 'ja.json'), newJa, { spaces: 2 });
fs.writeJsonSync(path.join(localesDir, 'ko.json'), newKo, { spaces: 2 });
fs.writeJsonSync(path.join(localesDir, 'it.json'), newIt, { spaces: 2 });

console.log('✓ 所有 locale 文件已更新为中文 key');
```

### 0.5 执行步骤

```bash
# 1. 安装依赖
pnpm add -D glob

# 2. 先替换 locale JSON（以中文为 key）
npx ts-node scripts/flip-locale-keys.ts

# 3. 替换代码中的 t() 调用
npx ts-node scripts/replace-i18n-keys.ts

# 4. 验证
pnpm dev
```

### 0.6 替换后的效果

**代码变化：**
```tsx
// 之前
<span>{t('Font size')}</span>
<span>{t('Background color')}</span>
title={t('Bold')}

// 之后
<span>{t('字号')}</span>
<span>{t('背景颜色')}</span>
title={t('加粗')}
```

**locale 文件变化：**

```json
// zh-Hans.json（基准）
{
  "字号": "字号",
  "背景颜色": "背景颜色",
  "加粗": "加粗"
}

// en.json
{
  "字号": "Font size",
  "背景颜色": "Background color",
  "加粗": "Bold"
}
```

### 0.7 验证清单

- [ ] 所有 `t('English')` 已替换为 `t('中文')`
- [ ] 所有 locale JSON 文件已更新
- [ ] 中文界面显示正常
- [ ] 切换到英文界面显示正常
- [ ] 无控制台错误

完成此步骤后，继续下面的 LinguiJS 迁移。

---

## 一、可行性分析

### 1.1 LinguiJS 优势

| 特性 | 说明 |
|------|------|
| **Babel 宏** | 编译时提取，无运行时开销 |
| **Tree-shaking** | 只打包使用的翻译 |
| **TypeScript** | 完整类型支持 |
| **ICU MessageFormat** | 支持复数、性别、选择等复杂格式 |
| **React 原生** | `<Trans>` 组件直接包裹 JSX |
| **CLI 工具** | 自动提取、编译、统计 |
| **PO 格式** | 与翻译工具（Crowdin、Lokalise、POEditor）无缝对接 |
| **活跃维护** | 2024 年仍在活跃更新 (v5.x) |

### 1.2 迁移复杂度评估

| 维度 | 评估 | 说明 |
|------|------|------|
| 代码改动量 | 中等 | ~250 处 `t()` 调用需调整 |
| 兼容性 | 高 | 支持 Vite、Webpack、Babel |
| 学习成本 | 低 | API 简洁，与当前用法相似 |
| 风险 | 低 | 可渐进式迁移，两套系统可共存 |

### 1.3 对比：当前方案 vs LinguiJS

| 特性 | 当前 I18nManager | LinguiJS |
|------|------------------|----------|
| 消息提取 | 手动/`easy-localized-translation` | `lingui extract` 自动 |
| 编译优化 | 无 | `lingui compile` 生成最小化目录 |
| 复数支持 | ❌ 无 | ✅ `<Plural>` 组件 |
| 日期/数字格式化 | ❌ 无 | ✅ `i18n.date()`, `i18n.number()` |
| JSX 翻译 | ❌ 需手动处理 | ✅ `<Trans>` 直接包裹 |
| 翻译平台集成 | 手动 | ✅ PO 格式标准 |
| 打包体积 | 全量 JSON | 按语言分割 + tree-shaking |

---

## 二、迁移步骤

### 阶段一：环境准备

#### 2.1 安装依赖

```bash
# 在根目录安装
pnpm add -D @lingui/cli @lingui/babel-plugin-lingui-macro

# 在各包安装运行时依赖
cd packages/email-editor-core
pnpm add @lingui/core

cd packages/email-editor-editor  
pnpm add @lingui/core @lingui/react

cd packages/email-editor-extensions
pnpm add @lingui/core @lingui/react
```

#### 2.2 创建 Lingui 配置文件

在项目根目录创建 `lingui.config.ts`:

```typescript
import { defineConfig } from '@lingui/cli';

export default defineConfig({
  // 源语言（开发时使用的语言）
  sourceLocale: 'zh-Hans',  // 中文作为源语言
  
  // 支持的语言列表
  locales: ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'it', 'tr'],
  
  // 消息目录配置
  catalogs: [
    {
      // 消息文件输出路径
      path: '<rootDir>/packages/email-editor-localization/locales/{locale}/messages',
      
      // 扫描哪些文件
      include: [
        '<rootDir>/packages/email-editor-core/src/**/*.{ts,tsx}',
        '<rootDir>/packages/email-editor-editor/src/**/*.{ts,tsx}',
        '<rootDir>/packages/email-editor-extensions/src/**/*.{ts,tsx}',
      ],
      
      // 排除的文件
      exclude: ['**/node_modules/**'],
    },
  ],
  
  // 使用 PO 格式（便于翻译平台集成）
  format: 'po',
  
  // 或使用 JSON 格式（与当前格式相似）
  // format: 'minimal',
  
  // 编译配置
  compileNamespace: 'es',
});
```

#### 2.3 配置 Babel

在 `packages/email-editor-editor/babel.config.js` (或类似配置文件):

```javascript
module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    // Lingui 宏插件必须放在最前面
    '@lingui/babel-plugin-lingui-macro',
    // 其他插件...
  ],
};
```

**对于 Vite 项目** (如 demo):

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
  ],
});
```

#### 2.4 添加 NPM 脚本

在根目录 `package.json`:

```json
{
  "scripts": {
    "i18n:extract": "lingui extract",
    "i18n:compile": "lingui compile --typescript",
    "i18n:extract-clean": "lingui extract --clean"
  }
}
```

---

### 阶段二：代码迁移

#### 2.5 创建新的 I18n Provider

创建 `packages/email-editor-editor/src/components/Provider/LinguiProvider/index.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

interface LinguiProviderProps {
  locale: string;
  children: React.ReactNode;
}

// 动态加载语言包
async function loadCatalog(locale: string) {
  const { messages } = await import(
    `@wa-dev/email-editor-localization/locales/${locale}/messages`
  );
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export function LinguiProvider({ locale, children }: LinguiProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadCatalog(locale).then(() => setIsLoaded(true));
  }, [locale]);

  if (!isLoaded) {
    return null; // 或 loading 状态
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
```

#### 2.6 迁移翻译调用

**当前写法：**

```tsx
// 导入全局 t
import { t } from '@core/utils/I18nManager';

// 或使用 window.t
const label = t('Font size');
```

**LinguiJS 写法：**

```tsx
// 方式一：使用 useLingui hook (推荐)
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const label = t`字号`;
  
  return <span>{label}</span>;
}

// 方式二：使用 Trans 组件 (用于 JSX 内容)
import { Trans } from '@lingui/react/macro';

function MyComponent() {
  return (
    <h1>
      <Trans>字号</Trans>
    </h1>
  );
}

// 方式三：使用 msg 进行消息定义（用于常量）
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

const messages = {
  fontSize: msg`字号`,
  fontFamily: msg`字体`,
};

function MyComponent() {
  const { _ } = useLingui();
  return <span>{_(messages.fontSize)}</span>;
}
```

#### 2.7 迁移对照表

> 假设已完成「第零步：英文 key 替换为中文 key」

| 当前写法（中文 key） | LinguiJS 写法 |
|----------------------|---------------|
| `t('字号')` | `` t`字号` `` |
| `t('你好')` | `<Trans>你好</Trans>` |
| `t('点击')` + 变量 | `` t`点击 ${name}` `` |
| `title={t('加粗')}` | `` title={t`加粗`} `` |

**如果未执行第零步（仍是英文 key）：**

| 当前写法（英文 key） | LinguiJS 写法 |
|----------------------|---------------|
| `t('Font size')` | `` t`字号` `` |
| `t('Hello')` | `<Trans>你好</Trans>` |

#### 2.8 处理复数

**当前方案（无复数支持）：**

```tsx
const text = count === 1 ? t('1 item') : t(`${count} items`);
```

**LinguiJS（完整复数支持）：**

```tsx
import { Plural } from '@lingui/react/macro';

<Plural
  value={count}
  one="# 个项目"
  other="# 个项目"
/>
```

#### 2.9 处理日期和数字

```tsx
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { i18n, t } = useLingui();
  const date = new Date();
  const price = 99.99;

  return (
    <div>
      <p>{t`最后登录：${i18n.date(date)}`}</p>
      <p>{t`价格：${i18n.number(price, { style: 'currency', currency: 'CNY' })}`}</p>
    </div>
  );
}
```

---

### 阶段三：翻译迁移

#### 2.10 转换现有翻译

创建迁移脚本 `scripts/migrate-i18n.ts`:

```typescript
import * as fs from 'fs-extra';
import * as path from 'path';

interface OldLocale {
  [key: string]: string;
}

interface PoEntry {
  msgid: string;
  msgstr: string;
}

function jsonToPo(jsonPath: string, poPath: string, locale: string) {
  const json: OldLocale = fs.readJsonSync(jsonPath);
  const entries: string[] = [
    `msgid ""`,
    `msgstr ""`,
    `"Language: ${locale}\\n"`,
    `"Content-Type: text/plain; charset=utf-8\\n"`,
    ``,
  ];

  for (const [key, value] of Object.entries(json)) {
    entries.push(`msgid "${escapePoString(key)}"`);
    entries.push(`msgstr "${escapePoString(value)}"`);
    entries.push('');
  }

  fs.outputFileSync(poPath, entries.join('\n'));
}

function escapePoString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

// 转换所有语言
const locales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'it', 'tr'];
const inputDir = 'packages/email-editor-localization/locales';

for (const locale of locales) {
  const jsonPath = path.join(inputDir, `${locale}.json`);
  const poDir = path.join(inputDir, locale);
  const poPath = path.join(poDir, 'messages.po');

  if (fs.existsSync(jsonPath)) {
    fs.ensureDirSync(poDir);
    jsonToPo(jsonPath, poPath, locale);
    console.log(`Converted ${locale}.json -> ${locale}/messages.po`);
  }
}
```

运行转换：

```bash
npx ts-node scripts/migrate-i18n.ts
```

#### 2.11 验证并提取新消息

```bash
# 首次提取
pnpm i18n:extract

# 查看统计
# 输出类似：
# Catalog statistics:
# ┌──────────┬─────────────┬─────────┐
# │ Language │ Total count │ Missing │
# ├──────────┼─────────────┼─────────┤
# │ zh-Hans  │     250     │    0    │
# │ en       │     250     │   50    │
# └──────────┴─────────────┴─────────┘
```

#### 2.12 编译消息目录

```bash
pnpm i18n:compile
```

这会生成 `messages.ts` 文件，包含编译后的消息。

---

### 阶段四：整合与测试

#### 2.13 更新 Demo 应用

修改 `demo/src/pages/Editor/index.tsx`:

```tsx
import { LinguiProvider } from '@wa-dev/email-editor-editor';

function EditorPage() {
  const [locale, setLocale] = useState('zh-Hans');

  return (
    <LinguiProvider locale={locale}>
      <EmailEditorProvider {...props}>
        <StandardLayout />
      </EmailEditorProvider>
    </LinguiProvider>
  );
}
```

#### 2.14 删除旧代码

完成迁移后，删除：

```
packages/email-editor-core/src/utils/I18nManager.tsx
packages/email-editor-editor/src/components/Provider/LanguageProvider/
packages/email-editor-editor/src/utils/generateTranslate.tsx
scripts/translate.ts
```

---

## 三、渐进式迁移策略

如果无法一次性迁移，可采用以下策略：

### 3.1 两套系统共存

```tsx
// 创建兼容层
import { useLingui } from '@lingui/react/macro';
import { t as legacyT } from '@core/utils/I18nManager';

export function useT() {
  try {
    const { t } = useLingui();
    return t;
  } catch {
    // Lingui Provider 不存在时，fallback 到旧系统
    return (strings: TemplateStringsArray, ...values: any[]) => {
      const key = strings.join('');
      return legacyT(key);
    };
  }
}
```

### 3.2 按包迁移

1. 先迁移 `email-editor-extensions`（UI 层）
2. 再迁移 `email-editor-editor`（编辑器核心）
3. 最后迁移 `email-editor-core`（区块定义）

---

## 四、翻译工作流

### 4.1 开发流程

```
开发者写代码（中文）
       ↓
   t`字号`
       ↓
pnpm i18n:extract    ← 提取到 PO 文件
       ↓
推送到翻译平台 (Crowdin/Lokalise)
       ↓
译者翻译
       ↓
拉取翻译
       ↓
pnpm i18n:compile    ← 编译为 JS
       ↓
   构建发布
```

### 4.2 集成 Crowdin（示例）

创建 `crowdin.yml`:

```yaml
project_id: 'your-project-id'
api_token: 'your-api-token'
base_path: '.'
preserve_hierarchy: true

files:
  - source: '/packages/email-editor-localization/locales/zh-Hans/messages.po'
    translation: '/packages/email-editor-localization/locales/%locale%/messages.po'
```

---

## 五、常见问题

### Q1: 如何处理动态 key？

**问题：** 当前有 `t(dynamicKey)` 的用法

**解决：** 使用 `msg` 宏预定义消息

```tsx
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

const blockTypeMessages = {
  text: msg`文本`,
  image: msg`图片`,
  button: msg`按钮`,
};

function BlockLabel({ type }: { type: keyof typeof blockTypeMessages }) {
  const { _ } = useLingui();
  return <span>{_(blockTypeMessages[type])}</span>;
}
```

### Q2: 如何在 React 组件外使用？

**问题：** 某些地方（如工具函数）需要翻译

**解决：** 使用 `i18n` 单例

```tsx
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

const errorMessage = msg`操作失败`;

function showError() {
  alert(i18n._(errorMessage));
}
```

### Q3: 如何保持 key 不变？

**问题：** 修改中文措辞会导致 key 变化

**解决：** 使用显式 ID

```tsx
import { Trans } from '@lingui/react/macro';

// 显式指定 ID，措辞变化不影响 key
<Trans id="toolbar.fontSize">字号大小</Trans>
```

### Q4: 如何处理现有的英文 key？

**问题：** 现有系统用英文作为 key

**解决：** 迁移时保持英文 ID

```tsx
// 保持与旧系统相同的 key
<Trans id="Font size">字号</Trans>
```

---

## 六、工作量评估

### 方案一：直接迁移到 LinguiJS（英文 key）

| 任务 | 预估时间 |
|------|----------|
| 环境配置（依赖、Babel、Lingui Config） | 2-4 小时 |
| 创建 LinguiProvider | 1-2 小时 |
| 迁移 `t()` 调用（~250处） | 4-8 小时 |
| 转换现有翻译文件 | 1-2 小时 |
| 测试验证 | 4-6 小时 |
| 文档更新 | 2 小时 |
| **总计** | **2-3 天** |

### 方案二：先替换中文 key，再迁移 LinguiJS（推荐）

| 任务 | 预估时间 |
|------|----------|
| **第零步：英文 key → 中文 key** | |
| ├ 编写替换脚本 | 1 小时 |
| ├ 执行自动替换 | 0.5 小时 |
| ├ 更新 locale JSON | 0.5 小时 |
| └ 测试验证 | 1-2 小时 |
| **小计** | **3-4 小时** |
| | |
| **第一步：迁移到 LinguiJS** | |
| ├ 环境配置 | 2-4 小时 |
| ├ 创建 LinguiProvider | 1-2 小时 |
| ├ 迁移 `t('中文')` → `` t`中文` `` | 3-5 小时 |
| ├ 转换翻译文件 | 1 小时 |
| └ 测试验证 | 3-4 小时 |
| **小计** | **1.5-2 天** |
| | |
| **总计** | **2-2.5 天** |

> 方案二虽然多了第零步，但后续迁移更顺畅，代码可读性也更好。

---

## 七、总结

### 推荐迁移路径

```
┌─────────────────────────────────────────────────────────────┐
│  第零步：英文 key → 中文 key（3-4 小时）                      │
│  t('Font size') → t('字号')                                  │
│  好处：代码可读性提升，迁移更平滑                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第一步：迁移到 LinguiJS（1.5-2 天）                          │
│  t('字号') → t`字号`                                         │
│  好处：编译优化、复数支持、翻译平台集成                         │
└─────────────────────────────────────────────────────────────┘
```

### 迁移收益

| 维度 | 改进 |
|------|------|
| **代码可读性** | 中文直接在代码中，无需查表 |
| **开发体验** | 宏自动提取，无需手动维护 key |
| **构建优化** | 编译时处理，减少运行时开销 |
| **翻译流程** | PO 标准格式，无缝对接翻译平台 |
| **类型安全** | TypeScript 完整支持 |
| **功能增强** | 复数、日期、数字格式化开箱即用 |

### 迁移风险

| 风险 | 缓解措施 |
|------|----------|
| 大量代码改动 | 自动化脚本替换，渐进式迁移 |
| 翻译丢失 | 转换脚本保留现有翻译 |
| 构建配置 | Vite/Webpack 均有官方插件 |

### 最终建议

1. **立即执行第零步**：英文 key → 中文 key
   - 工作量小（3-4 小时）
   - 立即获得代码可读性提升
   - 不影响现有功能

2. **择机执行第一步**：迁移到 LinguiJS
   - 获得完整 i18n 能力
   - 与翻译平台无缝集成

**推荐先执行第零步**，验证无误后再决定是否迁移到 LinguiJS。即使最终不迁移 LinguiJS，中文 key 方案也已经显著改善了开发体验。
