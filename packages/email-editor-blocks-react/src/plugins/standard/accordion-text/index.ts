import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IAccordionText } from './schema';
import { accordionTextDefinition } from './schema';
import { accordionTextRender } from './renderer';

export type { IAccordionText } from './schema';
export { accordionTextDefinition } from './schema';

export const AccordionText = defineBlock<IAccordionText>(accordionTextDefinition, accordionTextRender);
