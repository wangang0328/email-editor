import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ICarousel } from './schema';
import { carouselDefinition } from './schema';
import { carouselRender } from './renderer';

export type { ICarousel } from './schema';
export { carouselDefinition } from './schema';

export const Carousel = defineBlock<ICarousel>(carouselDefinition, carouselRender);
