# email-editor

<br>
<p align="center">
  <strong>基于 MJML 的邮件编辑器（二次开发版，支持 AI 等扩展）</strong>
</p>
<p align="center">
  <em>Based on <a href="https://github.com/arco-design/easy-email">Easy Email</a> · The most developer-friendly email editor</em>
</p>
<br>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  <a aria-label="React version" href="https://react.js">
    <img alt="" src="https://img.shields.io/badge/React-18.2-yellow.svg">
  </a>
  <a aria-label="MJML" href="https://mjml.io/">
    <img src="https://img.shields.io/badge/MJML-awesome-rgb(120 33 117).svg">
  </a>
  <a aria-label="TypeScript" href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/%3C/%3E-TypeScript-brightgreenred.svg">
  </a>
</p>

---

## 简介

本项目基于 [Easy Email](https://github.com/arco-design/easy-email) 进行二次开发，基于 [MJML](https://mjml.io/) 构建，兼容性好，支持拖拽编辑生成邮件代码，并计划接入 AI 等能力。

## 🚀 快速开始

```sh
npm install --save @wa-dev/email-editor-core @wa-dev/email-editor-editor @wa-dev/email-editor-extensions react-final-form
```

```js
import React from 'react';
import { BlockManager, BasicType, AdvancedType } from '@wa-dev/email-editor-core';
import { EmailEditor, EmailEditorProvider } from '@wa-dev/email-editor-editor';
import { ExtensionProps, StandardLayout } from '@wa-dev/email-editor-extensions';

import '@wa-dev/email-editor-editor/lib/style.css';
import '@wa-dev/email-editor-extensions/lib/style.css';
import '@arco-themes/react-easy-email-theme/css/arco.css';

const initialValues = {
  subject: 'Welcome',
  subTitle: 'Nice to meet you!',
  content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
};

export default function App() {
  return (
    <EmailEditorProvider
      data={initialValues}
      height={'calc(100vh - 72px)'}
      autoComplete
      dashed={false}
    >
      {({ values }) => (
        <StandardLayout showSourceCode={true}>
          <EmailEditor />
        </StandardLayout>
      )}
    </EmailEditorProvider>
  );
}
```

## ⚙️ 配置

| property      | Type       | Description                                   |
| ------------- | ---------- | --------------------------------------------- |
| height        | string / number | 容器高度                                  |
| data          | IEmailTemplate  | 初始数据（content, subject, subTitle）     |
| children      | ReactNode       | 渲染内容                                 |
| onSubmit      | function        | 提交时回调                               |
| fontList      | { value, label }[] | 字体列表                             |
| onUploadImage | (data: Blob) => Promise<string> | 图片上传回调              |

## 🛠️ 本地开发

```sh
git clone https://github.com/wangang0328/email-editor.git
cd email-editor

pnpm install
pnpm run install-all
pnpm run dev
```

欢迎提交 Issue 和 PR。

## 📦 包说明

| 包名 | 说明 |
|------|------|
| `@wa-dev/email-editor-core` | 核心数据与块管理 |
| `@wa-dev/email-editor-editor` | 编辑器 UI 与交互 |
| `@wa-dev/email-editor-extensions` | 扩展（属性面板、布局等） |
| `@wa-dev/email-editor-localization` | 多语言 |

## 📄 开源协议

本项目基于 [Easy Email](https://github.com/arco-design/easy-email) 二次开发，遵循 MIT 协议。详见 [LICENSE](./LICENSE)。
