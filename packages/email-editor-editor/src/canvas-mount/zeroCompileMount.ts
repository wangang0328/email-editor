import type { SegmentMountPlan } from './types';

/** 零编译挂载模式：只搬/删 DOM，不跑 mjml */
export function isZeroCompileMountMode(
  mode: SegmentMountPlan['mode'] | null | undefined,
): boolean {
  return mode === 'reorder' || mode === 'remove' || mode === 'splice';
}

export function isZeroCompileDomResultMode(
  mode: string | null | undefined,
): boolean {
  return mode === 'dom-reorder' || mode === 'dom-remove' || mode === 'dom-splice';
}

/** 计划中待删除的 segment uid */
export function getPlanRemoveStableIds(plan: SegmentMountPlan): string[] {
  return plan.removeStableIds ?? [];
}

/** 计划中目标 segment 顺序（splice / reorder / remove 后） */
export function getPlanTargetStableIds(plan: SegmentMountPlan): string[] {
  return (
    plan.spliceStableIds ??
    plan.reorderStableIds ??
    []
  );
}
