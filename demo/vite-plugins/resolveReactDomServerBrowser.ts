import type { Plugin } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:demo-react-dom-server';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

/**
 * demo 直连 packages 源码时会 import `react-dom/server`。
 * React 18+ 在 Vite 预构建里常解析到 Node 版；直接 alias 到 server.browser.js 又是 CJS，无命名导出。
 * 用虚拟模块 + optimizeDeps 预构建 server.browser，生成可用的 ESM 命名导出。
 */
export function resolveReactDomServerBrowser(): Plugin {
  const isReactDomServer = (id: string) =>
    id === 'react-dom/server' ||
    id === 'react-dom/server.js' ||
    /[/\\]react-dom[/\\]server(\.js)?$/.test(id);

  return {
    name: 'demo-resolve-react-dom-server-browser',
    enforce: 'pre',
    resolveId(id) {
      if (isReactDomServer(id)) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return null;
      return `
export {
  renderToStaticMarkup,
  renderToString,
  renderToReadableStream,
} from 'react-dom/server.browser';
`;
    },
  };
}
