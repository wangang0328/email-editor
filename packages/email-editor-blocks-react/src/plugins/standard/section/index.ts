import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ISection } from './schema';
import { sectionDefinition } from './schema';
import { sectionRender } from './renderer';

export type { ISection } from './schema';
export { sectionDefinition } from './schema';

export const Section = defineBlock<ISection>(sectionDefinition, sectionRender);
