import type { IBlock, IBlockData } from '@blocks/typings';
import type { BlockDefinition } from './types';

/** Merge schema definition + renderer into a registry-ready block. */
export function defineBlock<T extends IBlockData>(
  definition: BlockDefinition<T>,
  render: IBlock<T>['render'],
): IBlock<T> {
  // Do not spread `definition`: Lingui `name` uses a getter and must stay lazy until i18n is active.
  return {
    get name() {
      return definition.name;
    },
    type: definition.type,
    validParentType: definition.validParentType,
    create: definition.create,
    render,
  };
}
