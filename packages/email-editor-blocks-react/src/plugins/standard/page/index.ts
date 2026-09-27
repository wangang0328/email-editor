import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IPage } from './schema';
import { pageDefinition } from './schema';
import { pageRender } from './renderer';

export type { IPage } from './schema';
export { pageDefinition } from './schema';

export const Page = defineBlock<IPage>(pageDefinition, pageRender);
