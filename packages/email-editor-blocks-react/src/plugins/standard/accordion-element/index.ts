import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IAccordionElement } from './schema';
import { accordionElementDefinition } from './schema';
import { accordionElementRender } from './renderer';

export type { IAccordionElement } from './schema';
export { accordionElementDefinition } from './schema';

export const AccordionElement = defineBlock<IAccordionElement>(accordionElementDefinition, accordionElementRender);
