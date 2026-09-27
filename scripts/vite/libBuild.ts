import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

/** Vite lib 构建：编译 Lingui macro（文案 catalog 统一在 email-editor-localization） */
export function linguiReactPlugin(): Plugin[] {
  return [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
  ];
}

/**
 * React 运行时一律 external，避免把宿主项目的 react/react-dom 打进 lib。
 * 注意：Rollup 对字符串做精确匹配，`react-dom` 不会覆盖 `react-dom/client`。
 */
export const reactRuntimeExternals: (string | RegExp)[] = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom/client',
  'react-dom/server',
  'react-dom/server.browser',
  /^react\/.*/,
  /^react-dom(\/.*)?$/,
];

export const linguiExternals: (string | RegExp)[] = [
  '@lingui/core',
  '@lingui/react',
  /^@lingui\/.*/,
];

export const lodashEsExternals: (string | RegExp)[] = ['lodash-es', /^lodash-es\//];
