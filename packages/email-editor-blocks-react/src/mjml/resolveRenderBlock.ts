import { getDefaultEngine } from '@wa-dev/email-editor-engine';
import type { IBlock, IBlockData } from '@blocks/typings';

/**
 * MJML 渲染时按 type 查块。
 *
 * 刻意不 import `blockRegistry` / `ensureDefaultEngineBlocks`：
 * 块定义（如 page/renderer → BlockRenderer）在模块初始化阶段不能拉起插件注册，
 * 否则会与 standardBaseBlocks 形成循环依赖。
 *
 * 调用方需保证引擎已注册内置块（应用入口或 `getBlockByType` 首次调用时会完成）。
 */
export function resolveRenderBlock<T extends IBlockData = IBlockData>(
  type: string,
): IBlock<T> | undefined {
  return getDefaultEngine().registry.blocks.getBlockByType(type) as IBlock<T> | undefined;
}
