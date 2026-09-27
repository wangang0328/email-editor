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
        title: '@wa-dev/email-editor-panels',
      }) as Plugin)
    : null;

export default defineConfig({
  plugins: [...linguiReactPlugin(), bundleVisualizer()].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      '@panels': path.resolve(__dirname, 'src'),
      '@wa-dev/email-editor-ui': path.resolve('../email-editor-ui/src/index.ts'),
      '@wa-dev/email-editor-editor': path.resolve('../email-editor-editor/src/index.tsx'),
      '@wa-dev/email-editor-blocks-react': path.resolve('../email-editor-blocks-react/src/index.ts'),
      '@wa-dev/email-editor-shared': path.resolve('../email-editor-shared/src/index.ts'),
    },
  },
  build: {
    emptyOutDir: false,
    minify: true,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'email-editor-panels',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        ...reactRuntimeExternals,
        ...linguiExternals,
        ...lodashEsExternals,
        /^@wa-dev\/email-editor-/,
        'react-final-form',
        'react-final-form-arrays',
        'final-form',
        'final-form-arrays',
        'final-form-set-field-touched',
        'ahooks',
        'lucide-react',
        'codemirror',
        'react-codemirror2',
        'react-colorful',
        'color',
        'is-hotkey',
        'uuid',
        'react-use',
        'classnames',
      ],
    },
    outDir: 'lib',
  },
});
