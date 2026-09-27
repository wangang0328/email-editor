import type { IBlockData } from './types/block-data';

/** Structural validation only (no block registry lookup). */
export function isValidBlockDataShape(data: unknown): data is IBlockData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    typeof record.type === 'string' &&
    record.attributes !== undefined &&
    Array.isArray(record.children) &&
    record.data !== undefined
  );
}
