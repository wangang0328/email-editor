import { BlockRegistry } from './BlockRegistry';
import { TransformRegistry } from './TransformRegistry';

export class Registry {
  readonly blocks = new BlockRegistry();
  readonly transforms = new TransformRegistry();

  clear(): void {
    this.blocks.clear();
    this.transforms.clear();
  }
}
