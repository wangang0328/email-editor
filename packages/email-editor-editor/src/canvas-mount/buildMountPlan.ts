import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { canvasDebug } from '@wa-dev/email-editor-shared';
import { collectRenderSegments } from '@/render-cache/segments';
import { buildPageFingerprint } from '@/render-cache/hash';
import { collectSegmentStableIdsInDomOrder, findElementByStableIdInRoot } from './findElementByStableId';
import type { SegmentMountPlan, SegmentMountSnapshot } from './types';

export interface BuildMountPlanInput {
  pageData: IBlockData;
  container: HTMLElement;
  prevSnapshot: SegmentMountSnapshot | null;
  hasExistingMount: boolean;
}

export interface BuildMountPlanResult {
  plan: SegmentMountPlan;
  reason: string;
  changedSegmentIdxs: string[];
}

function reportPlan(result: BuildMountPlanResult): SegmentMountPlan {
  canvasDebug('mount.plan', {
    mode: result.plan.mode,
    reason: result.reason,
    changedCount: result.changedSegmentIdxs.length,
    changedIdxs: result.changedSegmentIdxs.slice(0, 5).join(','),
    totalSegments: result.plan.segments?.length ?? 0,
    removeCount: result.plan.removeStableIds?.length ?? 0,
  });
  return result.plan;
}

function orderEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

function uidSetSignature(uids: string[]): string {
  return [...uids].sort().join('|');
}

function survivingHashesUnchanged(
  targetUidOrder: string[],
  currentHashes: Record<string, string>,
  prevHashes: Record<string, string>,
): boolean {
  return targetUidOrder.every((uid) => prevHashes[uid] === currentHashes[uid]);
}

/**
 * 挂载计划（零 postProcess）。
 * splice：uid 顺序变、hash 未变 → 零编译。
 * remove：仅删段、幸存者 hash 未变 → 零编译删 DOM。
 * morph-full：新增段或 hash+结构混合变更。
 */
export function buildMountPlanWithReason(input: BuildMountPlanInput): BuildMountPlanResult {
  const segments = collectRenderSegments(input.pageData);

  if (!input.hasExistingMount || !input.prevSnapshot) {
    return {
      plan: { mode: 'full' },
      reason: !input.hasExistingMount
        ? 'cold-start:no-existing-mount'
        : 'cold-start:no-prev-snapshot',
      changedSegmentIdxs: segments.map((s) => s.idx),
    };
  }

  if (segments.length === 0) {
    // 删光所有段：仍可手术式清空
    const prevUids = Object.keys(input.prevSnapshot.hashes);
    if (prevUids.length > 0) {
      return {
        plan: {
          mode: 'remove',
          removeStableIds: prevUids,
          spliceStableIds: [],
        },
        reason: 'structure-change:remove-all-segments',
        changedSegmentIdxs: [],
      };
    }
    return {
      plan: { mode: 'full' },
      reason: 'no-segments-in-pageData',
      changedSegmentIdxs: [],
    };
  }

  const targetUidOrder = segments.map((s) => s.stableId);
  const prevUidOrder = input.prevSnapshot.segmentUidOrder;
  const currentHashes = Object.fromEntries(
    segments.map((s) => [s.stableId, s.subtreeHash]),
  );

  const prevUidSet = uidSetSignature(Object.keys(input.prevSnapshot.hashes));
  const currentUidSet = uidSetSignature(targetUidOrder);

  if (prevUidSet !== currentUidSet) {
    const prevUidList = Object.keys(input.prevSnapshot.hashes);
    const currentUidSetObj = new Set(targetUidOrder);
    const prevUidSetObj = new Set(prevUidList);

    const removedUids = prevUidList.filter((uid) => !currentUidSetObj.has(uid));
    const addedUids = targetUidOrder.filter((uid) => !prevUidSetObj.has(uid));

    // 仅删段、无新增，且幸存者内容 hash 未变 → 手术式 remove
    if (
      addedUids.length === 0 &&
      removedUids.length > 0 &&
      survivingHashesUnchanged(targetUidOrder, currentHashes, input.prevSnapshot.hashes)
    ) {
      return {
        plan: {
          mode: 'remove',
          removeStableIds: removedUids,
          spliceStableIds: targetUidOrder,
        },
        reason: `structure-change:remove-segments:${removedUids.length}`,
        changedSegmentIdxs: [],
      };
    }

    return {
      plan: { mode: 'morph-full' },
      reason: 'structure-change:segment-uid-set-changed',
      changedSegmentIdxs: segments.map((s) => s.idx),
    };
  }

  const planSegments = segments.map((segment) => {
    const prevHash = input.prevSnapshot!.hashes[segment.stableId];
    const changed = prevHash !== segment.subtreeHash;

    return {
      idx: segment.idx,
      stableId: segment.stableId,
      subtreeHash: segment.subtreeHash,
      action: changed ? ('replace' as const) : ('skip' as const),
    };
  });

  const changedSegmentIdxs = planSegments
    .filter((item) => item.action === 'replace')
    .map((item) => item.idx);

  const allHashesUnchanged = changedSegmentIdxs.length === 0;
  const orderChanged = !orderEqual(prevUidOrder, targetUidOrder);

  const liveUidOrder = collectSegmentStableIdsInDomOrder(input.container);
  const domOrderMismatch =
    liveUidOrder.length > 0 && !orderEqual(liveUidOrder, targetUidOrder);

  if (allHashesUnchanged && (orderChanged || domOrderMismatch)) {
    return {
      plan: {
        mode: 'splice',
        spliceStableIds: targetUidOrder,
        // 兼容旧消费方
        reorderStableIds: targetUidOrder,
      },
      reason: 'structure-change:splice-reorder-only',
      changedSegmentIdxs: [],
    };
  }

  if (allHashesUnchanged && !orderChanged) {
    const currentPageFp = buildPageFingerprint(input.pageData, 'edit');
    const pageChanged =
      Boolean(input.prevSnapshot.pageFingerprint) &&
      input.prevSnapshot.pageFingerprint !== currentPageFp;

    if (pageChanged) {
      return {
        plan: { mode: 'morph-full' },
        reason: 'page-fingerprint-changed',
        changedSegmentIdxs: segments.map((s) => s.idx),
      };
    }

    return {
      plan: { mode: 'noop' },
      reason: 'all-segments-unchanged',
      changedSegmentIdxs: [],
    };
  }

  if (orderChanged) {
    return {
      plan: { mode: 'morph-full' },
      reason: 'structure-change:reorder-with-content-change',
      changedSegmentIdxs,
    };
  }

  // 多段同时变更（跨列/跨 section 移动）：单段 morph 无法更新其余段 DOM
  if (changedSegmentIdxs.length > 1) {
    return {
      plan: { mode: 'morph-full' },
      reason: 'structure-change:multi-segment-replace',
      changedSegmentIdxs,
    };
  }

  for (const item of planSegments) {
    if (item.action !== 'replace') {
      continue;
    }

    const segment = segments.find((s) => s.stableId === item.stableId);
    if (segment && !segment.cacheable) {
      return {
        plan: { mode: 'morph-full' },
        reason: `non-cacheable-segment:${item.idx}`,
        changedSegmentIdxs,
      };
    }

    if (!findElementByStableIdInRoot(input.container, item.stableId, true)) {
      return {
        plan: { mode: 'morph-full' },
        reason: `live-dom-missing-segment:${item.stableId}`,
        changedSegmentIdxs,
      };
    }
  }

  return {
    plan: {
      mode: 'segment',
      segments: planSegments,
    },
    reason: `segment-replace:${changedSegmentIdxs.length}-of-${segments.length}`,
    changedSegmentIdxs,
  };
}

export function buildMountPlan(input: BuildMountPlanInput): SegmentMountPlan {
  return reportPlan(buildMountPlanWithReason(input));
}

export function buildSegmentMountSnapshot(pageData: IBlockData): SegmentMountSnapshot {
  const segments = collectRenderSegments(pageData);
  return {
    segmentUidOrder: segments.map((s) => s.stableId),
    hashes: Object.fromEntries(segments.map((s) => [s.stableId, s.subtreeHash])),
    pageFingerprint: buildPageFingerprint(pageData, 'edit'),
  };
}

/** @deprecated 使用 buildSegmentMountSnapshot */
export const buildSegmentHashSnapshot = buildSegmentMountSnapshot;

export function isReorderMountPlan(
  pageData: IBlockData,
  input: Omit<BuildMountPlanInput, 'pageData'>,
): boolean {
  const mode = buildMountPlanWithReason({ pageData, ...input }).plan.mode;
  return mode === 'reorder' || mode === 'splice';
}

export function isZeroCompileMountPlan(
  pageData: IBlockData,
  input: Omit<BuildMountPlanInput, 'pageData'>,
): boolean {
  const mode = buildMountPlanWithReason({ pageData, ...input }).plan.mode;
  return mode === 'reorder' || mode === 'splice' || mode === 'remove';
}
