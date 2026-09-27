import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import visualizer from 'rollup-plugin-visualizer';
import {
  linguiReactPlugin,
  linguiExternals,
  lodashEsExternals,
  reactRuntimeExternals,
} from '../../scripts/vite/libBuild';

const bundleVisualizer = (): Plugin | null =>
  process.env.ANALYZE === 'true'
    ? (visualizer({
        filename: path.resolve(__dirname, 'stats.html'),
        open: true,
        gzipSize: true,
        brotliSize: true,
        title: '@wa-dev/email-editor-blocks-react',
      }) as Plugin)
    : null;

const external = [
  ...reactRuntimeExternals,
  ...linguiExternals,
  ...lodashEsExternals,
  'he',
  'js-beautify',
  'uuid',
  '@wa-dev/email-editor-engine',
  '@wa-dev/email-editor-shared',
  '@wa-dev/email-editor-shared/types',
];

export default defineConfig({
  plugins: [...linguiReactPlugin(), bundleVisualizer()].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    minify: true,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external,
    },
    outDir: 'lib',
  },
});
