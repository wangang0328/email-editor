# Easy-email-editor

## Introduction

Email render and preview container.

## usage

```sh
$ npm install --save @wa-dev/email-editor-editor
```

or

```sh
$ yarn add @wa-dev/email-editor-editor
```

```js
import React from 'react';
import { BlockManager } from '@wa-dev/email-editor-core';
import { EmailEditor, EmailEditorProvider } from '@wa-dev/email-editor-editor';
import '@wa-dev/email-editor-editor/lib/style.css';

const initialValues = {
  subject: 'Welcome to Easy-email',
  subTitle: 'Nice to meet you!',
  content: BlockManager.getBlockByType(BasicType.PAGE).create({}),
};

export function App() {
  return (
    <EmailEditorProvider
      data={initialValues}
      height={'calc(100vh - 72px)'}
    >
      {({ values }) => {
        return <EmailEditor />;
      }}
    </EmailEditorProvider>
  );
}
```
