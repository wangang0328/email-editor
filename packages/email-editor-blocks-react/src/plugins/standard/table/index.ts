import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ITable } from './schema';
import { tableDefinition } from './schema';
import { tableRender } from './renderer';

export type { ITable } from './schema';
export { tableDefinition } from './schema';

export const Table = defineBlock<ITable>(tableDefinition, tableRender);
