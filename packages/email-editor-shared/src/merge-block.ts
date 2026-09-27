import { isArray, mergeWith } from 'lodash-es';
import type { IBlockData, RecursivePartial } from './types/block-data';

export function mergeBlock<T extends IBlockData>(
  a: T,
  b?: RecursivePartial<T>
): T {
  return mergeWith(a, b, (_objValue, srcValue) =>
    isArray(srcValue) ? srcValue : undefined
  );
}
