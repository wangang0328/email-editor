import { defineBlock } from '@blocks/plugins/defineBlock';
import type { IHero } from './schema';
import { heroDefinition } from './schema';
import { heroRender } from './renderer';

export type { IHero } from './schema';
export { heroDefinition } from './schema';

export const Hero = defineBlock<IHero>(heroDefinition, heroRender);
