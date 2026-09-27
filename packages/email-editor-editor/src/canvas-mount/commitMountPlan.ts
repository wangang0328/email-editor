import { htmlToFragment } from './htmlToFragment';
import { findElementByStableIdInRoot } from './findElementByStableId';
import { morphContainerChildren } from './morphDomOptions';
import { morphSegmentOuterHtml } from './morphSegmentNode';
import { reorderSegmentDom } from './reorderSegmentDom';
import { spliceSegmentDom } from './surgicalSegmentDom';
import { stabilizeEditCanvasImages, rewriteKnownFailedImages } from './stabilizeEditCanvasImages';
import { getPlanRemoveStableIds, getPlanTargetStableIds } from './zeroCompileMount';
import type { SegmentMountPlan } from './types';

export interface CommitMountPlanResult {
  commitMs: number;
  commitBatches: number;
  updatedSegments: number;
  usedMorph: boolean;
}

/** 避免 container.innerHTML= 时浏览器立刻请求已知失败的图片 URL */
function mountHtmlWithoutFailedImageRequests(
  container: HTMLElement,
  mountHtml: string,
): void {
  const template = document.createElement('template');
  template.innerHTML = mountHtml ?? '';
  rewriteKnownFailedImages(template.content);
  container.replaceChildren(...Array.from(template.content.childNodes));
}

export function commitMountPlan(
  plan: SegmentMountPlan,
  container: HTMLElement,
): CommitMountPlanResult {
  const commitStart = performance.now();
  let usedMorph = false;

  if (plan.mode === 'noop') {
    return { commitMs: 0, commitBatches: 0, updatedSegments: 0, usedMorph: false };
  }

  if (plan.mode === 'reorder' || plan.mode === 'splice') {
    const targetIds = getPlanTargetStableIds(plan);
    const ok = reorderSegmentDom(container, targetIds);
    return {
      commitMs: performance.now() - commitStart,
      commitBatches: 1,
      updatedSegments: ok ? targetIds.length : 0,
      usedMorph: false,
    };
  }

  if (plan.mode === 'remove') {
    const removeIds = getPlanRemoveStableIds(plan);
    const targetIds = getPlanTargetStableIds(plan);
    const ok = spliceSegmentDom(container, targetIds, removeIds);
    return {
      commitMs: performance.now() - commitStart,
      commitBatches: 1,
      // 用「涉及的段」计数：删除数 + 剩余目标序长度（失败则为 0）
      updatedSegments: ok ? removeIds.length + targetIds.length : 0,
      usedMorph: false,
    };
  }

  if (plan.mode === 'full') {
    mountHtmlWithoutFailedImageRequests(container, plan.mountHtml ?? '');
    stabilizeEditCanvasImages(container);
    return {
      commitMs: performance.now() - commitStart,
      commitBatches: 1,
      updatedSegments: plan.segments?.length ?? 0,
      usedMorph: false,
    };
  }

  if (plan.mode === 'morph-full') {
    if (plan.mountHtml) {
      morphContainerChildren(container, plan.mountHtml);
      usedMorph = true;
    }
    stabilizeEditCanvasImages(container);
    return {
      commitMs: performance.now() - commitStart,
      commitBatches: 1,
      updatedSegments: plan.segments?.length ?? 0,
      usedMorph,
    };
  }

  let updatedSegments = 0;
  const touchedSegmentRoots: Element[] = [];

  for (const item of plan.segments ?? []) {
    if (item.action === 'skip' || !item.outerHtml) {
      continue;
    }

    const liveNode = findElementByStableIdInRoot(container, item.stableId, true);
    if (!liveNode) {
      continue;
    }

    if (morphSegmentOuterHtml(liveNode, item.outerHtml)) {
      usedMorph = true;
      updatedSegments += 1;
      touchedSegmentRoots.push(liveNode);
      continue;
    }

    const frag = htmlToFragment(item.outerHtml);
    rewriteKnownFailedImages(frag);
    liveNode.replaceWith(frag);
    const replaced = findElementByStableIdInRoot(container, item.stableId, true);
    if (replaced) {
      touchedSegmentRoots.push(replaced);
    }
    updatedSegments += 1;
  }

  // 只稳定化变更段内图片，避免「别处删块」重跑 stabilize 干扰其他段 loading 态
  if (touchedSegmentRoots.length > 0) {
    for (const root of touchedSegmentRoots) {
      stabilizeEditCanvasImages(root);
    }
  } else if (updatedSegments > 0) {
    stabilizeEditCanvasImages(container);
  }

  return {
    commitMs: performance.now() - commitStart,
    commitBatches: 1,
    updatedSegments,
    usedMorph,
  };
}
