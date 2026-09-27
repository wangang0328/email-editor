import { canvasDebug, perfReport, perfTime } from '@wa-dev/email-editor-shared';
import type { SegmentDirectPatch } from '@/render-cache/types';
import { extractSegmentOuterHtml } from '@/render-cache/htmlSegments';
import { getBlockIndexRegistry } from '@/block-index/blockIndexStore';
import {
  buildMountPlanWithReason,
  buildSegmentMountSnapshot,
} from './buildMountPlan';
import { commitMountPlan } from './commitMountPlan';
import { postProcessEmailHtml, postProcessSegmentOuterHtml } from './postProcessEmailHtml';
import { reannotateSubtreeByRegistry } from './reannotateSubtreeByRegistry';
import { isZeroCompileMountMode } from './zeroCompileMount';
import type { EditCanvasMountInput, EditCanvasMountResult, SegmentMountPlan } from './types';

function mapZeroCompileResultMode(
  mode: SegmentMountPlan['mode'],
): EditCanvasMountResult['mode'] {
  if (mode === 'remove') return 'dom-remove';
  if (mode === 'splice') return 'dom-splice';
  return 'dom-reorder';
}

export function mountEditCanvas(input: EditCanvasMountInput): EditCanvasMountResult {
  const {
    container,
    rawHtml,
    pageData,
    options,
    prevSegmentSnapshot,
    skipMount,
    segmentPatches,
  } = input;

  const segmentSnapshot = buildSegmentMountSnapshot(pageData);
  const totalSegments = segmentSnapshot.segmentUidOrder.length;

  const emptyResult = (mode: EditCanvasMountResult['mode']): EditCanvasMountResult => ({
    mode,
    segmentSnapshot: prevSegmentSnapshot ?? segmentSnapshot,
    totalSegments,
    updatedSegments: 0,
    skippedSegments: 0,
    postProcessMs: 0,
    planMs: 0,
    fragmentBuildMs: 0,
    commitMs: 0,
    commitBatches: 0,
  });

  if (skipMount) {
    return emptyResult('skipped');
  }

  const planStart = performance.now();
  const { plan, reason: planReason, changedSegmentIdxs } = buildMountPlanWithReason({
    pageData,
    container,
    prevSnapshot: prevSegmentSnapshot,
    hasExistingMount: container.childNodes.length > 0,
  });
  const planMs = performance.now() - planStart;

  if (isZeroCompileMountMode(plan.mode)) {
    const fragmentBuildStart = performance.now();
    const { commitMs, commitBatches, updatedSegments, usedMorph } = commitMountPlan(
      plan,
      container,
    );

    // 零编译后按 registry 重写 idx 标注，避免 contenteditable / node-idx 仍指向旧路径
    let reannotated = 0;
    if (updatedSegments > 0) {
      const registry = getBlockIndexRegistry();
      if (registry) {
        reannotated = reannotateSubtreeByRegistry(container, registry);
        canvasDebug('mount.reannotate', {
          mode: plan.mode,
          updatedBlocks: reannotated,
          segmentCount: updatedSegments,
        });
      } else {
        canvasDebug('mount.reannotate.skipped', {
          reason: 'registry-null',
          mode: plan.mode,
          segmentCount: updatedSegments,
        });
        if (typeof console !== 'undefined') {
          console.warn(
            `[EE-Canvas] ${plan.mode} reannotate skipped: BlockIndexRegistry is null`,
          );
        }
      }
    }

    const fragmentBuildMs = performance.now() - fragmentBuildStart;
    const resultMode = mapZeroCompileResultMode(plan.mode);

    const result: EditCanvasMountResult = {
      mode: resultMode,
      segmentSnapshot,
      totalSegments,
      updatedSegments,
      skippedSegments: Math.max(0, totalSegments - updatedSegments),
      postProcessMs: 0,
      planMs,
      fragmentBuildMs,
      commitMs,
      commitBatches,
    };

    perfReport('MjmlDomRender.mount', {
      mode: result.mode,
      planReason,
      totalSegments: result.totalSegments,
      updatedSegments: result.updatedSegments,
      skippedSegments: result.skippedSegments,
      postProcessMs: 0,
      planMs: result.planMs,
      fragmentBuildMs: result.fragmentBuildMs,
      commitMs: result.commitMs,
      commitBatches: result.commitBatches,
      usedMorph,
      reannotated,
      removeCount: plan.removeStableIds?.length ?? 0,
    });

    return result;
  }

  if (!rawHtml) {
    return emptyResult('skipped');
  }

  if (plan.mode === 'noop') {
    const result: EditCanvasMountResult = {
      mode: 'dom-noop',
      segmentSnapshot,
      totalSegments,
      updatedSegments: 0,
      skippedSegments: totalSegments,
      postProcessMs: 0,
      planMs,
      fragmentBuildMs: 0,
      commitMs: 0,
      commitBatches: 0,
    };

    perfReport('MjmlDomRender.mount', {
      mode: result.mode,
      planReason,
      changedSegmentIdxs: changedSegmentIdxs.slice(0, 5).join(','),
      totalSegments: result.totalSegments,
      updatedSegments: 0,
      skippedSegments: result.skippedSegments,
      postProcessMs: 0,
      planMs: result.planMs,
      fragmentBuildMs: 0,
      commitMs: 0,
      commitBatches: 0,
    });

    return result;
  }

  const postProcessStart = performance.now();
  const directPlan =
    segmentPatches?.length && plan.mode === 'segment'
      ? mergeDirectPatches(plan, segmentPatches, options, pageData)
      : null;
  const resolvedPlan = directPlan ?? resolvePlanWithPostProcess(plan, rawHtml, pageData, options);
  const postProcessMs = performance.now() - postProcessStart;

  const fragmentBuildStart = performance.now();
  let activePlan = resolvedPlan;
  let { commitMs, commitBatches, updatedSegments, usedMorph } = commitMountPlan(
    activePlan,
    container,
  );

  const segmentReplaceMissed =
    activePlan.mode === 'segment' &&
    updatedSegments === 0 &&
    activePlan.segments?.some((item) => item.action === 'replace');

  if (segmentReplaceMissed) {
    const { mountHtml } = perfTime('MjmlDomRender', 'postProcess', () =>
      postProcessEmailHtml(rawHtml, options, pageData),
    );
    activePlan = { mode: 'morph-full', mountHtml };
    ({ commitMs, commitBatches, updatedSegments, usedMorph } = commitMountPlan(
      activePlan,
      container,
    ));
  }

  const fragmentBuildMs = performance.now() - fragmentBuildStart;

  const skippedSegments = Math.max(0, totalSegments - updatedSegments);
  const mode = mapPlanModeToResultMode(activePlan.mode);

  const result: EditCanvasMountResult = {
    mode,
    segmentSnapshot,
    totalSegments,
    updatedSegments:
      activePlan.mode === 'full' || activePlan.mode === 'morph-full'
        ? totalSegments
        : updatedSegments,
    skippedSegments:
      activePlan.mode === 'full' || activePlan.mode === 'morph-full'
        ? 0
        : skippedSegments,
    postProcessMs,
    planMs,
    fragmentBuildMs,
    commitMs,
    commitBatches,
  };

  perfReport('MjmlDomRender.mount', {
    mode: result.mode,
    planReason,
    changedSegmentIdxs: changedSegmentIdxs.slice(0, 5).join(','),
    totalSegments: result.totalSegments,
    updatedSegments: result.updatedSegments,
    skippedSegments: result.skippedSegments,
    postProcessMs: result.postProcessMs,
    planMs: result.planMs,
    fragmentBuildMs: result.fragmentBuildMs,
    commitMs: result.commitMs,
    commitBatches: result.commitBatches,
    usedMorph,
    directPatch: Boolean(directPlan),
  });

  return result;
}

function mapPlanModeToResultMode(
  mode: SegmentMountPlan['mode'],
): EditCanvasMountResult['mode'] {
  switch (mode) {
    case 'full':
      return 'dom-full';
    case 'morph-full':
      return 'dom-morph-full';
    case 'segment':
      return 'dom-segment';
    case 'remove':
      return 'dom-remove';
    case 'splice':
      return 'dom-splice';
    case 'reorder':
      return 'dom-reorder';
    default:
      return 'dom-noop';
  }
}

function mergeDirectPatches(
  plan: SegmentMountPlan,
  patches: SegmentDirectPatch[],
  options: EditCanvasMountInput['options'],
  pageData: EditCanvasMountInput['pageData'],
): SegmentMountPlan | null {
  if (plan.mode !== 'segment' || !plan.segments) {
    return null;
  }

  const replaceItems = plan.segments.filter((item) => item.action === 'replace');
  if (replaceItems.length !== patches.length) {
    return null;
  }

  const patchByUid = new Map(patches.map((patch) => [patch.stableId, patch]));
  const merged: NonNullable<SegmentMountPlan['segments']> = [];

  for (const item of plan.segments) {
    if (item.action === 'skip') {
      merged.push(item);
      continue;
    }

    const patch = patchByUid.get(item.stableId);
    if (
      !patch ||
      patch.idx !== item.idx ||
      patch.subtreeHash !== item.subtreeHash
    ) {
      return null;
    }

    const outerHtml = perfTime('MjmlDomRender', 'postProcess.segment', () =>
      postProcessSegmentOuterHtml(patch.rawHtml, patch.idx, options, pageData),
    );

    if (!outerHtml) {
      return null;
    }

    merged.push({ ...item, outerHtml });
  }

  return {
    mode: 'segment',
    segments: merged,
  };
}

function resolvePlanWithPostProcess(
  plan: SegmentMountPlan,
  rawHtml: string,
  pageData: EditCanvasMountInput['pageData'],
  options: EditCanvasMountInput['options'],
): SegmentMountPlan {
  if (plan.mode === 'full' || plan.mode === 'morph-full') {
    const { mountHtml } = perfTime('MjmlDomRender', 'postProcess', () =>
      postProcessEmailHtml(rawHtml, options, pageData),
    );
    return { mode: plan.mode, mountHtml };
  }

  if (plan.mode !== 'segment' || !plan.segments) {
    return plan;
  }

  const resolvedSegments: NonNullable<SegmentMountPlan['segments']> = [];

  for (const item of plan.segments) {
    if (item.action === 'skip') {
      resolvedSegments.push(item);
      continue;
    }

    if (item.outerHtml) {
      resolvedSegments.push(item);
      continue;
    }

    const rawSegment = extractSegmentOuterHtml(rawHtml, item.idx);
    if (!rawSegment) {
      break;
    }

    const outerHtml = perfTime('MjmlDomRender', 'postProcess.segment', () =>
      postProcessSegmentOuterHtml(rawSegment, item.idx, options, pageData),
    );

    if (!outerHtml) {
      break;
    }

    resolvedSegments.push({ ...item, outerHtml });
  }

  if (resolvedSegments.length !== plan.segments.length) {
    const { mountHtml } = perfTime('MjmlDomRender', 'postProcess', () =>
      postProcessEmailHtml(rawHtml, options, pageData),
    );
    return { mode: 'morph-full', mountHtml };
  }

  return {
    mode: 'segment',
    segments: resolvedSegments,
  };
}
