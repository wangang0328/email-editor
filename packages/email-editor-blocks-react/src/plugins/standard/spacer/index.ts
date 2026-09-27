import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ISpacer } from './schema';
import { spacerDefinition } from './schema';
import { spacerRender } from './renderer';

export type { ISpacer } from './schema';
export { spacerDefinition } from './schema';

export const Spacer = defineBlock<ISpacer>(spacerDefinition, spacerRender);
