import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { canvasDebug } from '@wa-dev/email-editor-shared';
import { fullCompileToHtml } from './fullCompile';
import {
  extractSegmentOuterHtml,
  rebuildPageForSegment,
  replaceSegmentInHtml,
} from './htmlSegments';
import { getRenderCacheManager } from './RenderCacheManager';
import type { RenderCacheKeyInput, RenderSegment, SegmentDirectPatch } from './types';

export interface SegmentAssemblyInput {
  baselineHtml: string;
  pageData: IBlockData;
  segments: RenderSegment[];
  keyInput: RenderCacheKeyInput;
  perfTag: string;
}

export interface SegmentAssemblyResult {
  html: string;
  /** L2 段缓存命中数 */
  l2Hits: number;
  /** 段级重编译数 */
  recomputed: number;
  /** 快路径：不拼接整页，由 mount 段级 morph */
  segmentPatches?: SegmentDirectPatch[];
  skipFullHtmlAssembly?: boolean;
}

/**
 * L2 段级缓存组装：在上一版 HTML 基线上，仅替换 hash 变化的段。
 *
 * 快路径（edit + 变更段 ≤ L2_DIRECT_PATCH_MAX）：
 * - 跳过 replaceSegmentInHtml 整页组装
 * - 输出 segmentPatches，由 mount 段级 postProcess + morph
 *
 * @see docs/编辑画布-L2段级直通挂载方案.md
 */
export function assembleFromSegmentCache(
  input: SegmentAssemblyInput,
): SegmentAssemblyResult | null {
  const { baselineHtml, pageData, segments, keyInput, perfTag } = input;

  if (!baselineHtml || segments.length === 0) {
    canvasDebug('compile.L2-abort', {
      reason: !baselineHtml ? 'empty-baseline' : 'no-segments',
    });
    return null;
  }

  const cache = getRenderCacheManager();
  const scanStart = performance.now();
  const changed: RenderSegment[] = [];
  let l2Hits = 0;

  for (const segment of segments) {
    const cacheable = segment.cacheable;
    const l2Key = cache.buildL2Key(segment.stableId, segment.subtreeHash, keyInput);
    const cached = cacheable ? cache.getL2(l2Key)?.html ?? null : null;

    if (cached) {
      l2Hits += 1;
      continue;
    }

    changed.push(segment);
  }

  const scanMs = performance.now() - scanStart;

  if (changed.length === 0) {
    return { html: baselineHtml, l2Hits, recomputed: 0 };
  }

  // 段内块移动会改变子树结构：L2 直通只 morph 单段且 baseline 滞后，易导致块丢失。
  // 统一走 replaceSegmentInHtml 拼回整页 HTML，再段级 morph，保证 baseline 与 DOM 一致。
  const useDirectPatch = false;

  if (useDirectPatch) {
    const patches: SegmentDirectPatch[] = [];

    for (const segment of changed) {
      const minimalPage = rebuildPageForSegment(pageData, segment.idx);
      if (!minimalPage) {
        canvasDebug('compile.L2-abort', {
          reason: 'rebuildPageForSegment-failed',
          segmentIdx: segment.idx,
        });
        return null;
      }

      const { html: compiled } = fullCompileToHtml({
        pageData: minimalPage,
        profile: keyInput.profile,
        dataSource: keyInput.dataSource,
        keepClassName: keyInput.keepClassName,
        perfTag,
      });

      const fragment = extractSegmentOuterHtml(compiled, segment.idx);
      if (!fragment) {
        canvasDebug('compile.L2-abort', {
          reason: 'extractSegmentOuterHtml-failed',
          segmentIdx: segment.idx,
        });
        return null;
      }

      if (segment.cacheable) {
        const l2Key = cache.buildL2Key(segment.stableId, segment.subtreeHash, keyInput);
        cache.setL2(l2Key, {
          segmentIdx: segment.idx,
          stableId: segment.stableId,
          html: fragment,
          subtreeHash: segment.subtreeHash,
          createdAt: Date.now(),
        });
      }

      patches.push({
        stableId: segment.stableId,
        idx: segment.idx,
        subtreeHash: segment.subtreeHash,
        rawHtml: fragment,
      });
    }

    canvasDebug('compile.L2-direct', {
      patchCount: patches.length,
      scanMs,
      l2Hits,
    });

    return {
      html: baselineHtml,
      l2Hits,
      recomputed: changed.length,
      segmentPatches: patches,
      skipFullHtmlAssembly: true,
    };
  }

  let html = baselineHtml;
  let recomputed = 0;

  for (const segment of changed) {
    const minimalPage = rebuildPageForSegment(pageData, segment.idx);
    if (!minimalPage) {
      canvasDebug('compile.L2-abort', {
        reason: 'rebuildPageForSegment-failed',
        segmentIdx: segment.idx,
      });
      return null;
    }

    const { html: compiled } = fullCompileToHtml({
      pageData: minimalPage,
      profile: keyInput.profile,
      dataSource: keyInput.dataSource,
      keepClassName: keyInput.keepClassName,
      perfTag,
    });

    const fragment = extractSegmentOuterHtml(compiled, segment.idx);
    if (!fragment) {
      canvasDebug('compile.L2-abort', {
        reason: 'extractSegmentOuterHtml-failed',
        segmentIdx: segment.idx,
      });
      return null;
    }

    if (segment.cacheable) {
      const l2Key = cache.buildL2Key(segment.stableId, segment.subtreeHash, keyInput);
      cache.setL2(l2Key, {
        segmentIdx: segment.idx,
        stableId: segment.stableId,
        html: fragment,
        subtreeHash: segment.subtreeHash,
        createdAt: Date.now(),
      });
    }

    recomputed += 1;

    const next = replaceSegmentInHtml(html, segment.idx, fragment);
    if (!next) {
      canvasDebug('compile.L2-abort', {
        reason: 'replaceSegmentInHtml-failed',
        segmentIdx: segment.idx,
      });
      return null;
    }
    html = next;
  }

  if (l2Hits === 0 && recomputed === segments.length && segments.length > 1) {
    canvasDebug('compile.L2-abort', {
      reason: 'all-segments-recomputed-fallback-to-full-miss',
      segmentCount: segments.length,
    });
    return null;
  }

  return { html, l2Hits, recomputed };
}
