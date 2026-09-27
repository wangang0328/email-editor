import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import visualizer from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolveReactDomServerBrowser } from './vite-plugins/resolveReactDomServerBrowser';

const bundleVisualizer = (): Plugin | null =>
  process.env.ANALYZE === 'true'
    ? (visualizer({
        filename: path.resolve(__dirname, 'stats.html'),
        open: true,
        gzipSize: true,
        brotliSize: true,
        title: 'email-editor demo',
      }) as Plugin)
    : null;

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    conditions: ['browser', 'development', 'module', 'import', 'default'],
    alias: {
      '@demo': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-final-form': path.resolve(__dirname, './node_modules/react-final-form'),
      '@wa-dev/email-editor-localization': path.resolve('../packages/email-editor-localization'),
      '@wa-dev/email-editor-blocks-react': path.resolve('../packages/email-editor-blocks-react/src/index.ts'),
      '@wa-dev/email-editor-engine': path.resolve('../packages/email-editor-engine/src/index.ts'),
      '@wa-dev/email-editor-shared/types': path.resolve('../packages/email-editor-shared/src/types/index.ts'),
      '@wa-dev/email-editor-shared': path.resolve('../packages/email-editor-shared/src/index.ts'),
      '@blocks': path.resolve('../packages/email-editor-blocks-react/src'),
      '@wa-dev/email-editor-editor/lib/locales.json': path.resolve(
        '../packages/email-editor-editor/public/locales.json',
      ),
      '@wa-dev/email-editor-editor': path.resolve('../packages/email-editor-editor/src/index.tsx'),
      '@wa-dev/email-editor-preset': path.resolve(
        '../packages/email-editor-preset/src/index.tsx',
      ),
      '@wa-dev/email-editor-ui': path.resolve(
        '../packages/email-editor-ui/src/index.ts',
      ),
      '@panels': path.resolve('../packages/email-editor-panels/src'),
      '@wa-dev/email-editor-panels': path.resolve(
        '../packages/email-editor-panels/src/index.ts',
      ),
      '@extensions': path.resolve('../packages/email-editor-preset/src'),
      '@preset': path.resolve('../packages/email-editor-preset/src'),
      '@': path.resolve('../packages/email-editor-editor/src'),
    },
  },
  optimizeDeps: {
    include: ['react-dom/server.browser'],
    exclude: ['react-dom/server'],
    esbuildOptions: {
      conditions: ['browser', 'development', 'module', 'import', 'default'],
    },
  },
  define: {},
  build: {
    minify: true,
    manifest: true,
    sourcemap: false,
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
        },
        chunkFileNames(info) {
          if (
            ['mjml-browser', 'html2canvas', 'browser-image-compression'].some(name =>
              info.name?.includes(name),
            )
          ) {
            return '[name].js';
          }
          return '[name]-[hash].js';
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
    bundleVisualizer(),
    resolveReactDomServerBrowser(),
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    createHtmlPlugin({
      inject: {
        data: {
          buildTime: `<meta name="updated-time" content="${new Date().toUTCString()}" />`,
        },
      },
    }),
  ].filter(Boolean),
});
