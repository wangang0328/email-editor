import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IButton } from './schema';
import { buttonDefinition } from './schema';
import { buttonRender } from './renderer';

export type { IButton } from './schema';
export { buttonDefinition } from './schema';

export const Button = defineBlock<IButton>(buttonDefinition, buttonRender);
