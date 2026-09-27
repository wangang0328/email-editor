import type { BlockMap, BlockRegistryEntry } from '../types/block';

export class BlockRegistry {
  private blocksMap: BlockMap = {};
  private autoCompletePath: Record<string, string[][]> = {};

  registerBlocks(blocksMap: BlockMap): void {
    this.blocksMap = {
      ...this.blocksMap,
      ...blocksMap,
    };
    this.autoCompletePath = this.computeAutoCompletePaths();
  }

  registerBlock(block: BlockRegistryEntry): void {
    this.registerBlocks({ [block.type]: block });
  }

  getBlocks(): BlockRegistryEntry[] {
    return Object.values(this.blocksMap);
  }

  getBlockByType<T = unknown>(type: string): BlockRegistryEntry<T> | undefined {
    return this.blocksMap[type] as BlockRegistryEntry<T> | undefined;
  }

  getBlocksByType(types: string[]): Array<BlockRegistryEntry | undefined> {
    return types.map((type) => this.blocksMap[type]);
  }

  getSchemas(): Map<string, BlockRegistryEntry> {
    return new Map(Object.entries(this.blocksMap));
  }

  has(type: string): boolean {
    return Boolean(this.blocksMap[type]);
  }

  getAutoCompleteFullPath(): Record<string, string[][]> {
    if (Object.keys(this.autoCompletePath).length === 0) {
      this.autoCompletePath = this.computeAutoCompletePaths();
    }
    return this.autoCompletePath;
  }

  getAutoCompletePath(type: string, targetType: string): string[] | null {
    const block = this.getBlockByType(type);
    if (!block) {
      throw new Error(`Can you register ${type} block`);
    }
    if (block.validParentType.includes(targetType)) {
      return [];
    }
    const paths = this.getAutoCompleteFullPath()[type]?.find((item) =>
      item.filter((_, index) => index !== 0).includes(targetType)
    );
    if (!paths) {
      return null;
    }
    const findIndex = paths.findIndex((item) => item === targetType);
    return paths.slice(1, findIndex);
  }

  clear(): void {
    this.blocksMap = {};
    this.autoCompletePath = {};
  }

  private computeAutoCompletePaths(): Record<string, string[][]> {
    const paths: Record<string, string[][]> = {};

    const renderFullPath = (
      type: string,
      pathObj: string[][],
      prevPaths: string[]
    ): void => {
      const block = this.getBlockByType(type);
      if (!block) {
        throw new Error(`Can you register ${type} block`);
      }
      const currentPaths = [...prevPaths, type];
      if (block.validParentType.length === 0) {
        pathObj.push(currentPaths);
        return;
      }
      block.validParentType.forEach((parentType) => {
        renderFullPath(parentType, pathObj, currentPaths);
      });
    };

    Object.values(this.blocksMap).forEach((item) => {
      paths[item.type] = [];
      renderFullPath(item.type, paths[item.type], []);
    });

    return paths;
  }
}
