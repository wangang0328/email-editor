import { ensureBlockStableId } from '@wa-dev/email-editor-shared';
import type { IBlockData, RecursivePartial } from './typings';
import { getBlockByType } from './blockRegistry';

export function createBlockDataByType<T extends IBlockData>(
  type: string,
  payload?: RecursivePartial<T>,
): IBlockData {
  const component = getBlockByType(type);
  if (component) {
    const block = component.create(payload as RecursivePartial<T>);
    ensureBlockStableId(block);
    return block;
  }
  throw new Error(`No match \`${type}\` block`);
}
