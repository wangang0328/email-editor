/**
 * 结构变更后强制 morph-full 的场景：
 * - 新增段 / 复制 / autoComplete 包层 / 跨父移动（需要新 HTML）
 *
 * 不应 mark 的场景（交给 MountPlan 零编译）：
 * - 同父移段 → splice
 * - 同父删段 → remove
 * - 删非段块（text 等）→ segment hash 变，走段级编译
 */
let pendingStructureMutation = false;

export function markStructureMutation(): void {
  pendingStructureMutation = true;
}

export function hasStructureMutation(): boolean {
  return pendingStructureMutation;
}

export function consumeStructureMutation(): boolean {
  const pending = pendingStructureMutation;
  pendingStructureMutation = false;
  return pending;
}

/** @deprecated 使用 markStructureMutation */
export const markMoveMount = markStructureMutation;

/** @deprecated 使用 consumeStructureMutation */
export const consumeMoveMount = consumeStructureMutation;
