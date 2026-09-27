import { getDefaultEngine } from '@wa-dev/email-editor-engine';
import type { BlockMap } from '@wa-dev/email-editor-engine';
import type { IBlock, IBlockData } from './typings';
import { ensureDefaultEngineBlocks } from './bootstrap/ensureDefaultEngineBlocks';

function getRegistry() {
  ensureDefaultEngineBlocks();
  return getDefaultEngine().registry.blocks;
}

export function getBlocks(): IBlock[] {
  return getRegistry().getBlocks() as IBlock[];
}

export function registerBlocks(blocksMap: Record<string, IBlock>): void {
  getRegistry().registerBlocks(blocksMap as BlockMap);
}

export function getBlockByType<T extends IBlockData = IBlockData>(
  type: string,
): IBlock<T> | undefined {
  return getRegistry().getBlockByType(type) as IBlock<T> | undefined;
}

export function getAutoCompletePath(
  type: string,
  targetType: string,
): string[] | null {
  return getRegistry().getAutoCompletePath(type, targetType);
}
