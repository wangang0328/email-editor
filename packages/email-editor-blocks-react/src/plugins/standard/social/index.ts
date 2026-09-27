import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ISocial } from './schema';
import { socialDefinition } from './schema';
import { socialRender } from './renderer';

export type { ISocial } from './schema';
export { socialDefinition } from './schema';

export const Social = defineBlock<ISocial>(socialDefinition, socialRender);
