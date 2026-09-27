import { getAutoCompletePath } from './blockRegistry';

/** Bridge path depth between block types (e.g. text â†?column â†?section â†?wrapper). */
export function ancestorOf(type: string, targetType: string): number {
  const paths = getAutoCompletePath(type, targetType);
  if (paths) {
    return paths.length + 1;
  }
  return -1;
}
