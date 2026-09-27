/**
 * Minimal block contract stored in engine registry.
 * Compatible with @wa-dev/email-editor-blocks-react IBlock without importing core.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BlockRegistryEntry<TBlockData = any> {
  name: string;
  type: string;
  validParentType: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (payload?: any) => TBlockData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (...args: any[]) => any;
}

export type BlockMap = Record<string, BlockRegistryEntry>;
