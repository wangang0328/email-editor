import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { reactRuntimeExternals } from '../../scripts/vite/libBuild';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: false,
    minify: true,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'email-editor-ui',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        ...reactRuntimeExternals,
        /^@radix-ui\/.*/,
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-react',
        'overlayscrollbars',
        'overlayscrollbars-react',
        'sonner',
        'vaul',
        '@tanstack/react-virtual',
        'react-arborist',
      ],
    },
    outDir: 'lib',
  },
});
