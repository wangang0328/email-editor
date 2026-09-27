/**
 * 同父节点内移动时，将「插入前」下标换算为 splice(remove) 之后的插入下标。
 * insertIndex 语义：变更前 children 上的 insert-before 位置（可等于 length 表示追加）。
 */
export function adjustInsertIndexAfterRemove(
  sourceIndex: number,
  insertIndex: number,
): number {
  if (sourceIndex < insertIndex) {
    return insertIndex - 1;
  }
  return insertIndex;
}

/**
 * 同父内判断移动是否无实际变化。
 */
export function isNoOpSameParentMove(
  sourceIndex: number,
  insertIndexBeforeRemove: number,
): boolean {
  return (
    adjustInsertIndexAfterRemove(sourceIndex, insertIndexBeforeRemove) ===
    sourceIndex
  );
}
