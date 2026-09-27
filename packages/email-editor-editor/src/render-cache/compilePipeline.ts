import { ensurePageBlockStableIds, perfReport, perfTime } from '@wa-dev/email-editor-shared';
import { canvasDebug } from '@wa-dev/email-editor-shared';
import { getRenderCacheManager } from './RenderCacheManager';
import { applyBreakpointOverride, extractSegmentOuterHtml } from './htmlSegments';
import { assembleFromSegmentCache } from './segmentAssembly';
import { collectRenderSegments } from './segments';
import { fullCompileToHtml } from './fullCompile';
import type {
  CompilePipelineInput,
  CompilePipelineResult,
  RenderCacheKeyInput,
} from './types';

export { fullCompileToHtml } from './fullCompile';
export type { FullCompileOptions } from './fullCompile';

/**
 * 三级渲染缓存编排入口。
 *
 * 决策顺序：
 * 1. L3 — domPreserve / tryL3
 * 2. L1 — 整页 key 命中
 * 3. L2 — 段级 HTML 缓存（在 baselineHtml 上按段替换，只编译未命中段）
 * 4. miss — 全量编译，回填 L1 + seed L2
 *
 * L2 是「部分结构缓存」，不等于结构增量 diff（增删移分类已移除）。
 */
export function compileWithRenderCache(
  input: CompilePipelineInput,
  perfTag: string,
): CompilePipelineResult {
  const pipelineStart = performance.now();
  const cache = getRenderCacheManager();
  const useCache = input.useCache !== false;

  const pageData = applyBreakpointOverride(input.pageData, input.breakpointOverride);
  ensurePageBlockStableIds(pageData);
  const keyInput: RenderCacheKeyInput = {
    pageData,
    profile: input.profile,
    dataSource: input.dataSource,
    breakpointOverride: input.breakpointOverride,
    keepClassName: input.keepClassName,
  };

  // ── L3：富文本 DOM 保留 ──
  if (input.domPreserve) {
    const result: CompilePipelineResult = {
      html: input.domPreserve.html,
      mjmlString: '',
      hitLevel: 'L3',
      pipelineMs: performance.now() - pipelineStart,
    };
    perfReport('RenderCache.pipeline', {
      hitLevel: 'L3',
      pipelineMs: result.pipelineMs,
      profile: input.profile,
    });
    return result;
  }

  if (useCache) {
    const l3Hit = cache.tryL3(keyInput);
    if (l3Hit) {
      const result: CompilePipelineResult = {
        html: l3Hit,
        mjmlString: '',
        hitLevel: 'L3',
        pipelineMs: performance.now() - pipelineStart,
      };
      perfReport('RenderCache.pipeline', {
        hitLevel: 'L3',
        pipelineMs: result.pipelineMs,
        profile: input.profile,
      });
      return result;
    }
  }

  const l1Key = cache.buildL1Key(keyInput);

  // ── L1：整页命中 ──
  if (useCache) {
    const l1Entry = cache.getL1(l1Key);
    if (l1Entry) {
      const result: CompilePipelineResult = {
        html: l1Entry.html,
        mjmlString: l1Entry.mjmlString ?? '',
        hitLevel: 'L1',
        pipelineMs: performance.now() - pipelineStart,
      };
      perfReport('RenderCache.pipeline', {
        hitLevel: 'L1',
        pipelineMs: result.pipelineMs,
        profile: input.profile,
      });
      return result;
    }
    cache.recordL1Miss();
  }

  const currentSegments = collectRenderSegments(pageData);

  // ── L2：段级缓存（部分结构缓存）──
  // 需调用方传入 baselineHtml（上一帧整页 HTML）；典型改色场景 hitLevel=L2、pipelineMs~20ms
  if (useCache && input.baselineHtml) {
    const assembled = assembleFromSegmentCache({
      baselineHtml: input.baselineHtml,
      pageData,
      segments: currentSegments,
      keyInput,
      perfTag,
    });

    if (assembled) {
      if (assembled.recomputed === 0) {
        canvasDebug('compile.L2-abort', {
          reason: 'no-segment-recomputed-on-L1-miss',
        });
      } else {
        if (!assembled.skipFullHtmlAssembly) {
          cache.setL1(l1Key, { html: assembled.html, createdAt: Date.now() });
        }
        const result: CompilePipelineResult = {
          html: assembled.html,
          mjmlString: '',
          hitLevel: 'L2',
          segmentStats: {
            l2Hits: assembled.l2Hits,
            recomputed: assembled.recomputed,
            total: currentSegments.length,
          },
          segmentPatches: assembled.segmentPatches,
          skipFullHtmlAssembly: assembled.skipFullHtmlAssembly,
          pipelineMs: performance.now() - pipelineStart,
        };
        canvasDebug('compile.L2-hit', {
          l2Hits: assembled.l2Hits,
          recomputed: assembled.recomputed,
          totalSegments: currentSegments.length,
          pipelineMs: result.pipelineMs,
          directPatch: Boolean(assembled.skipFullHtmlAssembly),
          patchCount: assembled.segmentPatches?.length ?? 0,
        });
        perfReport('RenderCache.pipeline', {
          hitLevel: 'L2',
          pipelineMs: result.pipelineMs,
          profile: input.profile,
          l2Hits: assembled.l2Hits,
          recomputed: assembled.recomputed,
          totalSegments: currentSegments.length,
          directPatch: Boolean(assembled.skipFullHtmlAssembly),
        });
        return result;
      }
    }

    cache.recordL2Miss();
    canvasDebug('compile.L2-miss', {
      reason: 'assembleFromSegmentCache-returned-null',
      hasBaseline: Boolean(input.baselineHtml),
      baselineLength: input.baselineHtml?.length ?? 0,
      segmentCount: currentSegments.length,
    });
  }

  // ── 全量编译（miss）──
  canvasDebug('compile.full-miss', {
    reason: !input.baselineHtml
      ? 'no-baseline-html'
      : 'L2-assemble-failed-or-L1-miss',
    segmentCount: currentSegments.length,
  });
  const { html, mjmlString } = fullCompileToHtml({
    pageData,
    profile: input.profile,
    dataSource: input.dataSource,
    keepClassName: input.keepClassName,
    perfTag,
  });

  if (useCache) {
    cache.setL1(l1Key, { html, mjmlString, createdAt: Date.now() });
    cache.seedL2FromFullHtml(
      currentSegments,
      html,
      keyInput,
      extractSegmentOuterHtml,
    );
  }

  const result: CompilePipelineResult = {
    html,
    mjmlString,
    hitLevel: 'miss',
    pipelineMs: performance.now() - pipelineStart,
  };

  perfReport('RenderCache.pipeline', {
    hitLevel: 'miss',
    pipelineMs: result.pipelineMs,
    profile: input.profile,
    htmlLength: html.length,
  });

  return result;
}
