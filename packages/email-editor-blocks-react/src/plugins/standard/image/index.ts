import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IImage } from './schema';
import { imageDefinition } from './schema';
import { imageRender } from './renderer';

export type { IImage } from './schema';
export { imageDefinition } from './schema';

export const Image = defineBlock<IImage>(imageDefinition, imageRender);
