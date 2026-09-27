import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IColumn } from './schema';
import { columnDefinition } from './schema';
import { columnRender } from './renderer';

export type { IColumn } from './schema';
export { columnDefinition } from './schema';

export const Column = defineBlock<IColumn>(columnDefinition, columnRender);
