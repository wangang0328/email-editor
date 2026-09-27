import type { IBlockData, RecursivePartial } from '@blocks/typings';

/** Block metadata + factory without React render (schema side). */
export interface BlockDefinition<T extends IBlockData = IBlockData> {
  name: string;
  type: string;
  validParentType: string[];
  create: (payload?: RecursivePartial<T>) => T;
}
