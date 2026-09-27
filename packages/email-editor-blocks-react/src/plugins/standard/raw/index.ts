import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IRaw } from './schema';
import { rawDefinition } from './schema';
import { rawRender } from './renderer';

export type { IRaw } from './schema';
export { rawDefinition } from './schema';

export const Raw = defineBlock<IRaw>(rawDefinition, rawRender);
