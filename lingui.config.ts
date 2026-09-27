import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'zh-Hans',
  locales: ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'it', 'tr'],
  catalogs: [
    {
      path: '<rootDir>/packages/email-editor-localization/lingui/{locale}/messages',
      include: [
        '<rootDir>/packages/email-editor-blocks-react/src/**/*.{ts,tsx}',
        '<rootDir>/packages/email-editor-editor/src/**/*.{ts,tsx}',
        '<rootDir>/packages/email-editor-panels/src/**/*.{ts,tsx}',
        '<rootDir>/packages/email-editor-preset/src/**/*.{ts,tsx}',
      ],
      exclude: ['**/node_modules/**'],
    },
  ],
  format: 'po',
  compileNamespace: 'es',
});
