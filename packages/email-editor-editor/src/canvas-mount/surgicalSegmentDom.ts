import { findElementByStableIdInRoot } from './findElementByStableId';
import { reorderSegmentDom } from './reorderSegmentDom';

/**
 * 按 uid 从 live DOM 删除 segment 根节点（零编译）。
 * 返回实际删除数量；任一 uid 找不到则仍尽量删除其余，最终返回 false 表示未全部成功。
 */
export function removeSegmentDom(
  container: HTMLElement,
  removeStableIds: string[],
): { ok: boolean; removed: number } {
  if (removeStableIds.length === 0) {
    return { ok: true, removed: 0 };
  }

  let removed = 0;
  let allFound = true;

  for (const stableId of removeStableIds) {
    const el = findElementByStableIdInRoot(container, stableId, true);
    if (!el) {
      allFound = false;
      continue;
    }
    el.remove();
    removed += 1;
  }

  return { ok: allFound, removed };
}

/**
 * 手术式对齐 segment 列表：先删多余 uid，再按目标序搬 DOM。
 * 覆盖同父删段 / 同父移段（splice）零编译路径。
 */
export function spliceSegmentDom(
  container: HTMLElement,
  targetOrder: string[],
  removeStableIds: string[] = [],
): boolean {
  if (removeStableIds.length > 0) {
    const { ok } = removeSegmentDom(container, removeStableIds);
    if (!ok) {
      return false;
    }
  }

  if (targetOrder.length === 0) {
    return true;
  }

  return reorderSegmentDom(container, targetOrder);
}
