import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IAccordion } from './schema';
import { accordionDefinition } from './schema';
import { accordionRender } from './renderer';

export type { IAccordion } from './schema';
export { accordionDefinition } from './schema';

export const Accordion = defineBlock<IAccordion>(accordionDefinition, accordionRender);
