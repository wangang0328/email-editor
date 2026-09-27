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
        title: '@wa-dev/email-editor-editor',
      }) as Plugin)
    : null;

export default defineConfig({
  plugins: [...linguiReactPlugin(), bundleVisualizer()].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@blocks': path.resolve('../email-editor-blocks-react/src'),
      '@wa-dev/email-editor-blocks-react': path.resolve('../email-editor-blocks-react/src/index.ts'),
      '@wa-dev/email-editor-engine': path.resolve('../email-editor-engine/src/index.ts'),
      '@wa-dev/email-editor-shared/types': path.resolve('../email-editor-shared/src/types/index.ts'),
      '@wa-dev/email-editor-shared': path.resolve('../email-editor-shared/src/index.ts'),
    },
  },
  define: {},
  build: {
    emptyOutDir: false,
    minify: true,
    manifest: false,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: '@wa-dev/email-editor-editor',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      plugins: [],
      external: [
        ...reactRuntimeExternals,
        ...linguiExternals,
        ...lodashEsExternals,
        'mjml-browser',
        'react-final-form',
        'final-form',
        'final-form-arrays',
        'final-form-set-field-touched',
        'is-hotkey',
        'lucide-react',
        '@wa-dev/email-editor-blocks-react',
        '@wa-dev/email-editor-engine',
        '@wa-dev/email-editor-shared',
        '@wa-dev/email-editor-shared/types',
        '@wa-dev/email-editor-localization',
        /^@wa-dev\/email-editor-localization\/.*/,
      ],
      output: {},
    },
    outDir: 'lib',
  },
  optimizeDeps: {
    include: ['@wa-dev/email-editor-blocks-react'],
  },
  css: {
    modules: {
      localsConvention: 'dashes',
    },
    preprocessorOptions: {
      scss: {},
    },
  },
});
