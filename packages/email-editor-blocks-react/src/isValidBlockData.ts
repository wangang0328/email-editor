import { isValidBlockDataShape } from '@wa-dev/email-editor-shared';
import type { IBlockData } from './typings';
import { getBlockByType } from './blockRegistry';

export function isValidBlockData<T>(data: unknown): data is IBlockData & T {
  try {
    return (
      isValidBlockDataShape(data) &&
      Boolean(getBlockByType((data as IBlockData).type))
    );
  } catch {
    return false;
  }
}
