import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IWrapper } from './schema';
import { wrapperDefinition } from './schema';
import { wrapperRender } from './renderer';

export type { IWrapper } from './schema';
export { wrapperDefinition } from './schema';

export const Wrapper = defineBlock<IWrapper>(wrapperDefinition, wrapperRender);
