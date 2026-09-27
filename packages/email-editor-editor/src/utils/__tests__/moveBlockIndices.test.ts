import {
  adjustInsertIndexAfterRemove,
  isNoOpSameParentMove,
} from '../moveBlockIndices';

describe('moveBlockIndices', () => {
  it('adjusts forward moves after remove', () => {
    // [A,B,C] move A(0) before-index 2 (after B) → insert at 1 after remove
    expect(adjustInsertIndexAfterRemove(0, 2)).toBe(1);
    expect(isNoOpSameParentMove(0, 1)).toBe(true);
    expect(isNoOpSameParentMove(0, 2)).toBe(false);
  });

  it('keeps backward insert index', () => {
    // [A,B,C] move C(2) before-index 0 → insert at 0
    expect(adjustInsertIndexAfterRemove(2, 0)).toBe(0);
    expect(isNoOpSameParentMove(2, 2)).toBe(true);
  });

  it('supports move-down as insert-before index+2', () => {
    // ContextMenu 下移：源 index 0 → insertBefore 2 → 校正后 1
    expect(adjustInsertIndexAfterRemove(0, 2)).toBe(1);
    expect(isNoOpSameParentMove(0, 2)).toBe(false);

    // 源 index 1 → insertBefore 3 → 校正后 2
    expect(adjustInsertIndexAfterRemove(1, 3)).toBe(2);
  });

  it('supports move-up as insert-before index-1', () => {
    expect(adjustInsertIndexAfterRemove(1, 0)).toBe(0);
    expect(isNoOpSameParentMove(1, 0)).toBe(false);
  });
});
