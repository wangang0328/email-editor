import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IAccordionTitle } from './schema';
import { accordionTitleDefinition } from './schema';
import { accordionTitleRender } from './renderer';

export type { IAccordionTitle } from './schema';
export { accordionTitleDefinition } from './schema';

export const AccordionTitle = defineBlock<IAccordionTitle>(accordionTitleDefinition, accordionTitleRender);
