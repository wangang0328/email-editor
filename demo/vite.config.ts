import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import { injectHtml } from 'vite-plugin-html';

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      '@wa-dev/email-editor-editor/lib/style.css': path.resolve(__dirname, 'package.json'), // 没有用的，只是防止css 404报错
      '@wa-dev/email-editor-extensions/lib/style.css': path.resolve(__dirname, 'package.json'), // 没有用的，只是防止css 404报错
      react: path.resolve('./node_modules/react'),
      'react-final-form': path.resolve(__dirname, './node_modules/react-final-form'),
      '@demo': path.resolve(__dirname, './src'),
      '@extensions': path.resolve('../packages/email-editor-extensions/src'),
      '@core': path.resolve('../packages/email-editor-core/src'),
      '@arco-themes': path.resolve('./node_modules/@arco-themes'),
      '@': path.resolve('../packages/email-editor-editor/src'),
      '@wa-dev/email-editor-core': path.resolve('../packages/email-editor-core/src/index.tsx'),
      '@wa-dev/email-editor-editor/lib/locales.json': path.resolve(
        '../packages/email-editor-editor/public/locales.json',
      ),
      '@wa-dev/email-editor-localization': path.resolve('../packages/email-editor-localization'),
      '@wa-dev/email-editor-editor': path.resolve('../packages/email-editor-editor/src/index.tsx'),
      '@wa-dev/email-editor-extensions': path.resolve(
        '../packages/email-editor-extensions/src/index.tsx',
      ),
      '@arco-design/web-react/dist/css/arco.css': path.resolve(
        './node_modules/@arco-design/web-react/dist/css/arco.css',
      ),
    },
  },

  define: {},
  esbuild: {
    jsxInject: 'import "@arco-design/web-react/dist/css/arco.css";',
  },
  build: {
    minify: 'terser',
    manifest: true,
    sourcemap: true,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/html2canvas\/.*/.test(id)) {
            return 'html2canvas';
          }
          if (/\/node_modules\/lodash\/.*/.test(id)) {
            return 'lodash';
          }
          if (/\/node_modules\/mjml-browser\/.*/.test(id)) {
            return 'mjml-browser';
          }
          if (/@wa-dev\/email-editor.*/.test(id)) {
            return 'email-editor-editor';
          }
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'dashes',
    },
    preprocessorOptions: {
      scss: {},
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    reactRefresh(),

    injectHtml({
      data: {
        buildTime: `<meta name="updated-time" content="${new Date().toUTCString()}" />`,
      },
    }),
  ].filter(Boolean),
});
