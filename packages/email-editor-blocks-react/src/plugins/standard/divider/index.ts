import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IDivider } from './schema';
import { dividerDefinition } from './schema';
import { dividerRender } from './renderer';

export type { IDivider } from './schema';
export { dividerDefinition } from './schema';

export const Divider = defineBlock<IDivider>(dividerDefinition, dividerRender);
