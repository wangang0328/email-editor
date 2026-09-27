import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IText } from './schema';
import { textDefinition } from './schema';
import { textRender } from './renderer';

export type { IText } from './schema';
export { textDefinition } from './schema';

export const Text = defineBlock<IText>(textDefinition, textRender);
