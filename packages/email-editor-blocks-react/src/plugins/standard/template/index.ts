import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ITemplate } from './schema';
import { templateDefinition } from './schema';
import { templateRender } from './renderer';

export type { ITemplate } from './schema';
export { templateDefinition } from './schema';

export const Template = defineBlock<ITemplate>(templateDefinition, templateRender);
