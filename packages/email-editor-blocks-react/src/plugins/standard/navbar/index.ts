import { defineBlock } from '@blocks/plugins/defineBlock';
import type { INavbar } from './schema';
import { navbarDefinition } from './schema';
import { navbarRender } from './renderer';

export type { INavbar } from './schema';
export { navbarDefinition } from './schema';

export const Navbar = defineBlock<INavbar>(navbarDefinition, navbarRender);
