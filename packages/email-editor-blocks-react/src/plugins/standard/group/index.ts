import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IGroup } from './schema';
import { groupDefinition } from './schema';
import { groupRender } from './renderer';

export type { IGroup } from './schema';
export { groupDefinition } from './schema';

export const Group = defineBlock<IGroup>(groupDefinition, groupRender);
