import { getDefaultEngine } from '@wa-dev/email-editor-engine';
import { standardBlocksPlugin } from '../plugins/standardBlocksPlugin';

let defaultBlocksRegistered = false;

/**
 * 应用/编辑器入口：确保默认引擎已挂载内置块插件。
 * 块定义模块不应 import 本文件；见 `registry/layers.md`。
 */
export function ensureDefaultEngineBlocks(): void {
  if (defaultBlocksRegistered) {
    return;
  }

  const engine = getDefaultEngine();
  if (!engine.isInitialized()) {
    engine.use(standardBlocksPlugin());
    engine.initSync();
  }

  defaultBlocksRegistered = true;
}
