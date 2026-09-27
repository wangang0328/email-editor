import type { PluginContext } from '@wa-dev/email-editor-engine';
import { standardBlocks } from '@blocks/plugins/standard/standardBlocks';
import { advancedBlocks } from '@blocks/plugins/advanced';

export function registerBuiltInBlocks(ctx: PluginContext): void {
  ctx.registry.blocks.registerBlocks({
    ...standardBlocks,
    ...advancedBlocks,
  });
}
