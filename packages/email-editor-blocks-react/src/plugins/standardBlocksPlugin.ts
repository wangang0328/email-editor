import type { EmailEditorPlugin } from '@wa-dev/email-editor-engine';
import { registerBuiltInBlocks } from './registerBuiltInBlocks';

/** 内置标准块 + 高级块插件（组合根在 registerBuiltInBlocks） */
export function standardBlocksPlugin(): EmailEditorPlugin {
  return {
    id: '@wa-dev/standard-blocks',
    displayName: 'Standard & Advanced Blocks',
    setup(ctx) {
      registerBuiltInBlocks(ctx);
    },
  };
}
