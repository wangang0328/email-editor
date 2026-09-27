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

export const reactRuntimeExternals: (string | RegExp)[] = [
  'react',
  'react-dom',
  'react-dom/server',
  'react/jsx-runtime',
];

export const linguiExternals: (string | RegExp)[] = [
  '@lingui/core',
  '@lingui/react',
  /^@lingui\/.*/,
];

export const lodashEsExternals: (string | RegExp)[] = ['lodash-es', /^lodash-es\//];
