import { IBlock, IBlockData } from '@blocks/typings';

export function createBlock<T extends IBlockData>(block: IBlock<T>): IBlock<T> {
  return block;
}
