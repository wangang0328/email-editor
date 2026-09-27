import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-final-form';
import { IPage } from '@wa-dev/email-editor-blocks-react';
import { cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { useEditorContext } from '@/hooks/useEditorContext';
import { useEditorProps } from '@/hooks/useEditorProps';
import { useHoverIdx } from '@/hooks/useHoverIdx';
import { IEmailTemplate } from '@/typings';
import {
  getShadowRoot,
  isRichTextChromeInteraction,
  isRichTextToolbarInteraction,
  isSidebarFocused,
  shouldPreserveInlineTextDom,
  suppressInlineTextPreserve,
} from '@/utils';
import { DATA_RENDER_COUNT } from '@/constants';
import {
  perfReport,
  perfReportInitialRender,
  perfTime,
  perfCounter,
  canvasDebug,
  canvasDebugHintOnce,
} from '@wa-dev/email-editor-shared';
import type { SegmentDirectPatch } from '@/render-cache/types';
import {
  compileWithRenderCacheAsync,
  isCompileJobCancelled,
  getRenderCacheManager,
  replaceSegmentInHtml,
} from '@/render-cache';
import {
  mountEditCanvas,
  notifyCanvasMountCommit,
  buildMountPlanWithReason,
  buildSegmentMountSnapshot,
  postProcessEmailHtml,
  type SegmentMountSnapshot,
} from '@/canvas-mount';
import { consumeStructureMutation, hasStructureMutation } from '@/canvas-mount/canvasMountFlags';
import { morphContainerChildren } from '@/canvas-mount/morphDomOptions';
import { stabilizeEditCanvasImages } from '@/canvas-mount/stabilizeEditCanvasImages';
import {
  isZeroCompileDomResultMode,
  isZeroCompileMountMode,
} from '@/canvas-mount/zeroCompileMount';

/**
 * 编辑模式画布渲染核心（EDIT Tab）。
 *
 * @see docs/编辑画布-stableId与Worker架构方案.md
 */
export function MjmlDomRender() {
  const { pageData: content } = useEditorContext();
  const form = useForm<IEmailTemplate>();
  const latestPageDataRef = useRef<IPage | null>(content ?? null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [renderVersion, setRenderVersion] = useState(0);
  const { dashed, mergeTags, enabledMergeTagsBadge } = useEditorProps();
  const { isDragging } = useHoverIdx();
  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;
  const [isTextFocus, setIsTextFocus] = useState(false);

  const isTextFocusing = shouldPreserveInlineTextDom();

  const lastCompiledHtmlRef = useRef('');
  const prevSegmentSnapshotRef = useRef<SegmentMountSnapshot | null>(null);
  const lastMountedHtmlRef = useRef('');
  const mergeTagsDataSourceRef = useRef<{
    source: typeof mergeTags;
    cloned: Record<string, unknown>;
  } | null>(null);
  const renderCache = useMemo(() => getRenderCacheManager(), []);
  const pipelineRunRef = useRef(0);
  const scheduleRafRef = useRef(0);
  const scheduleDebounceRef = useRef(0);
  const pendingSourceRef = useRef('init');
  const mergeTagsRef = useRef(mergeTags);
  mergeTagsRef.current = mergeTags;
  const enabledMergeTagsBadgeRef = useRef(enabledMergeTagsBadge);
  enabledMergeTagsBadgeRef.current = enabledMergeTagsBadge;

  useEffect(() => {
    canvasDebugHintOnce();
  }, []);

  useEffect(() => {
    containerElRef.current = containerRef;
  }, [containerRef]);

  useEffect(() => {
    if (containerRef) {
      containerRef.setAttribute(DATA_RENDER_COUNT, String(renderVersion));
    }
  }, [containerRef, renderVersion]);

  useEffect(() => {
    setIsTextFocus(isTextFocusing);
  }, [isTextFocusing]);

  useEffect(() => {
    const syncTextFocus = (e?: Event) => {
      if (e && isRichTextToolbarInteraction(e)) {
        return;
      }
      setIsTextFocus(shouldPreserveInlineTextDom());
    };

    window.addEventListener('click', syncTextFocus, true);
    window.addEventListener('focusin', syncTextFocus, true);
    window.addEventListener('focusout', syncTextFocus, true);

    const shadow = getShadowRoot();
    shadow?.addEventListener('click', syncTextFocus, true);
    shadow?.addEventListener('focusin', syncTextFocus, true);
    shadow?.addEventListener('focusout', syncTextFocus, true);

    return () => {
      window.removeEventListener('click', syncTextFocus, true);
      window.removeEventListener('focusin', syncTextFocus, true);
      window.removeEventListener('focusout', syncTextFocus, true);
      shadow?.removeEventListener('click', syncTextFocus, true);
      shadow?.removeEventListener('focusin', syncTextFocus, true);
      shadow?.removeEventListener('focusout', syncTextFocus, true);
    };
  }, []);

  useEffect(() => {
    const exitTextFocusForSidebar = (target: Element | null) => {
      if (!target?.closest?.('[data-email-editor-sidebar]')) {
        return;
      }

      const shadow = getShadowRoot();
      const active = shadow?.activeElement;
      if (
        active instanceof HTMLElement &&
        active.getAttribute('contenteditable') === 'true'
      ) {
        active.blur();
      }

      suppressInlineTextPreserve();
      setIsTextFocus(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      exitTextFocusForSidebar(e.target instanceof Element ? e.target : null);
    };

    const onClick = (e: MouseEvent) => {
      if (isRichTextToolbarInteraction(e)) {
        return;
      }
      if (isRichTextChromeInteraction(e)) {
        return;
      }
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest?.('[data-email-editor-sidebar]')) {
        exitTextFocusForSidebar(target);
        return;
      }
      setIsTextFocus(false);
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('click', onClick);

    const onFocusIn = (e: FocusEvent) => {
      exitTextFocusForSidebar(e.target instanceof Element ? e.target : null);
    };
    window.addEventListener('focusin', onFocusIn, true);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('click', onClick);
      window.removeEventListener('focusin', onFocusIn, true);
    };
  }, []);

  useEffect(() => {
    const root = getShadowRoot();
    if (!root) return;
    const onClick = () => {
      if (shouldPreserveInlineTextDom()) {
        setIsTextFocus(true);
      }
    };

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    if (!isTextFocus && !isSidebarFocused()) {
      renderCache.releaseDomPreserve();
    }
  }, [isTextFocus, renderCache]);

  const runPipeline = useMemoizedFn(async (source: string) => {
    const container = containerElRef.current;
    const pageData = latestPageDataRef.current;

    if (!pageData || !container) {
      perfReport('MjmlDomRender.pipeline', {
        skipped: true,
        reason: 'no-container-or-data',
        source,
      });
      canvasDebug('pipeline.skipped', {
        reason: 'no-container-or-data',
        source,
      });
      return;
    }

    if (isDraggingRef.current) {
      perfReport('MjmlDomRender.pipeline', {
        skipped: true,
        reason: 'dragging',
        source,
      });
      canvasDebug('pipeline.skipped', {
        reason: 'canvas-frozen',
        isDragging: true,
        source,
      });
      return;
    }

    if (shouldPreserveInlineTextDom() && !hasStructureMutation()) {
      perfReport('MjmlDomRender.pipeline', {
        skipped: true,
        reason: 'text-focus',
        source,
      });
      canvasDebug('pipeline.skipped', {
        reason: 'canvas-frozen',
        isTextFocus: true,
        source,
      });
      return;
    }

    const runId = ++pipelineRunRef.current;
    const pipelineStart = performance.now();

    const earlyPlan =
      container.childNodes.length > 0
        ? buildMountPlanWithReason({
            pageData,
            container,
            prevSnapshot: prevSegmentSnapshotRef.current,
            hasExistingMount: true,
          }).plan
        : null;

    const forceStructureMorph = consumeStructureMutation();

    canvasDebug('pipeline.start', {
      runId,
      earlyPlanMode: earlyPlan?.mode,
      hasPrevSnapshot: Boolean(prevSegmentSnapshotRef.current),
      source,
      forceStructureMorph,
    });

    let dataSource: Record<string, unknown>;
    const currentMergeTags = mergeTagsRef.current;
    const cachedMergeTags = mergeTagsDataSourceRef.current;
    if (cachedMergeTags && cachedMergeTags.source === currentMergeTags) {
      dataSource = cachedMergeTags.cloned;
    } else {
      dataSource = perfTime('MjmlDomRender', 'cloneDeep.mergeTags', () => {
        const cloned = cloneDeep(currentMergeTags ?? {}) as Record<string, unknown>;
        mergeTagsDataSourceRef.current = { source: currentMergeTags, cloned };
        return cloned;
      });
    }

    let compiledHtml = lastCompiledHtmlRef.current;
    let hitLevel: 'L1' | 'L2' | 'L3' | 'miss' = 'L1';
    let pipelineMs = 0;
    let segmentStats: { l2Hits: number; recomputed: number; total: number } | undefined;
    let segmentPatches: SegmentDirectPatch[] | undefined;
    let skipFullHtmlAssembly = false;

    if (isZeroCompileMountMode(earlyPlan?.mode) && !forceStructureMorph) {
      pipelineMs = performance.now() - pipelineStart;
      canvasDebug('compile.zero-skip', {
        runId,
        mode: earlyPlan?.mode,
        segmentCount:
          earlyPlan?.spliceStableIds?.length ??
          earlyPlan?.reorderStableIds?.length ??
          0,
        removeCount: earlyPlan?.removeStableIds?.length ?? 0,
      });
    } else {
      let compileResult;
      try {
        compileResult = await compileWithRenderCacheAsync(
          {
            pageData,
            baselineHtml: lastCompiledHtmlRef.current || undefined,
            profile: 'edit',
            dataSource,
          },
          'MjmlDomRender',
        );
      } catch (error) {
        if (isCompileJobCancelled(error)) {
          canvasDebug('pipeline.compile-cancelled', { runId, source });
          return;
        }
        throw error;
      }

      if (runId !== pipelineRunRef.current) {
        canvasDebug('pipeline.superseded', { runId, source, stage: 'after-compile' });
        return;
      }

      compiledHtml = compileResult.html;
      hitLevel = compileResult.hitLevel;
      pipelineMs = compileResult.pipelineMs;
      segmentStats = compileResult.segmentStats;
      segmentPatches = compileResult.segmentPatches;
      skipFullHtmlAssembly = Boolean(compileResult.skipFullHtmlAssembly);

      if (!skipFullHtmlAssembly) {
        lastCompiledHtmlRef.current = compiledHtml;
        renderCache.preserveDom(compiledHtml, {
          pageData,
          profile: 'edit',
          dataSource,
        });
      }
    }

    if (runId !== pipelineRunRef.current) {
      return;
    }

    perfReport('MjmlDomRender.pipeline', {
      pipelineMs,
      htmlLength: compiledHtml.length,
      cacheHitLevel: hitLevel,
      source,
      directPatch: skipFullHtmlAssembly,
      ...(segmentStats
        ? {
            l2Hits: segmentStats.l2Hits,
            l2Recomputed: segmentStats.recomputed,
            l2TotalSegments: segmentStats.total,
          }
        : {}),
    });

    if (hitLevel === 'miss' && !isZeroCompileMountMode(earlyPlan?.mode)) {
      perfReportInitialRender(pipelineMs, {
        jsonToMjmlIncluded: true,
        mjmlCompileIncluded: true,
      });
    }

    const planNeedsMount =
      !earlyPlan ||
      earlyPlan.mode === 'full' ||
      earlyPlan.mode === 'morph-full' ||
      earlyPlan.mode === 'segment' ||
      isZeroCompileMountMode(earlyPlan.mode);

    const htmlUnchanged =
      !skipFullHtmlAssembly &&
      compiledHtml === lastMountedHtmlRef.current &&
      container.childNodes.length > 0;
    if (htmlUnchanged && !planNeedsMount) {
      canvasDebug('pipeline.mount-skipped', {
        runId,
        reason: 'compiled-html-unchanged',
        hitLevel,
        pipelineMs,
        earlyPlanMode: earlyPlan?.mode,
      });
      return;
    }

    const applyFullMorph = (reason: string, htmlOverride?: string) => {
      const html = htmlOverride ?? compiledHtml;
      canvasDebug('pipeline.force-morph', { runId, reason });
      const { mountHtml } = postProcessEmailHtml(
        html,
        { enabledMergeTagsBadge: Boolean(enabledMergeTagsBadgeRef.current) },
        pageData,
      );
      morphContainerChildren(container, mountHtml);
      // morph 可能清掉 / 替换 img；必须重跑 stabilize，否则别处结构变更后 loading 态丢失
      stabilizeEditCanvasImages(container);
      prevSegmentSnapshotRef.current = buildSegmentMountSnapshot(pageData);
      lastCompiledHtmlRef.current = html;
      lastMountedHtmlRef.current = html;
      renderCache.preserveDom(html, {
        pageData,
        profile: 'edit',
        dataSource,
      });
      setRenderVersion((v) => v + 1);
      notifyCanvasMountCommit();
    };

    if (
      forceStructureMorph &&
      compiledHtml &&
      container.childNodes.length > 0
    ) {
      applyFullMorph('structure-mutation');
      canvasDebug('pipeline.end', {
        runId,
        hitLevel,
        pipelineMs,
        mountMode: 'dom-morph-full',
        totalMs: performance.now() - pipelineStart,
        source,
        structureMutation: true,
      });
      return;
    }

    const mountResult = mountEditCanvas({
      container,
      rawHtml: compiledHtml,
      pageData,
      options: {
        enabledMergeTagsBadge: Boolean(enabledMergeTagsBadgeRef.current),
      },
      prevSegmentSnapshot: prevSegmentSnapshotRef.current,
      skipMount: false,
      segmentPatches,
    });

    if (runId !== pipelineRunRef.current || mountResult.mode === 'skipped') {
      return;
    }

    const htmlDiffersFromDom =
      compiledHtml !== lastMountedHtmlRef.current &&
      container.childNodes.length > 0;

    const compileFreshBaseline = async (perfSuffix: string) => {
      try {
        const syncResult = await compileWithRenderCacheAsync(
          {
            pageData,
            profile: 'edit',
            dataSource,
          },
          `MjmlDomRender.${perfSuffix}`,
        );
        if (runId !== pipelineRunRef.current) {
          return null;
        }
        return syncResult;
      } catch (error) {
        if (isCompileJobCancelled(error)) {
          canvasDebug('pipeline.compile-cancelled', { runId, source, stage: perfSuffix });
          return null;
        }
        throw error;
      }
    };

    if (mountResult.mode === 'dom-noop' && htmlDiffersFromDom) {
      applyFullMorph('noop-but-html-changed');
      return;
    }

    if (mountResult.mode !== 'dom-noop') {
      const segmentMountMissed =
        mountResult.mode === 'dom-segment' &&
        mountResult.updatedSegments === 0 &&
        earlyPlan?.mode === 'segment' &&
        earlyPlan.segments?.some((item) => item.action === 'replace');

      if (segmentMountMissed) {
        applyFullMorph('segment-replace-missed');
        return;
      }

      if (
        isZeroCompileDomResultMode(mountResult.mode) &&
        mountResult.updatedSegments === 0
      ) {
        const syncResult = await compileFreshBaseline('zero-compile-fallback');
        if (!syncResult) {
          return;
        }
        compiledHtml = syncResult.html;
        applyFullMorph(`${mountResult.mode}-dom-failed`, compiledHtml);
        canvasDebug('pipeline.end', {
          runId,
          hitLevel: syncResult.hitLevel,
          pipelineMs: syncResult.pipelineMs,
          mountMode: 'dom-morph-full',
          totalMs: performance.now() - pipelineStart,
          source,
          zeroCompileFallback: true,
          failedMode: mountResult.mode,
        });
        return;
      }

      prevSegmentSnapshotRef.current = mountResult.segmentSnapshot;
      if (!isZeroCompileDomResultMode(mountResult.mode)) {
        if (!skipFullHtmlAssembly) {
          lastMountedHtmlRef.current = compiledHtml;
        }
        setRenderVersion((v) => v + 1);
      }
      notifyCanvasMountCommit();

      if (
        isZeroCompileDomResultMode(mountResult.mode) &&
        mountResult.updatedSegments > 0
      ) {
        // 零编译路径：DOM 已手术 + reannotate。
        // 清空 baseline，避免下一轮 L2 按旧 node-idx 从 baseline 抽段。
        lastCompiledHtmlRef.current = '';
        lastMountedHtmlRef.current = '';
        canvasDebug('pipeline.zero-compile-baseline-invalidate', {
          runId,
          mode: mountResult.mode,
          reason: 'avoid-stale-idx-baseline-after-surgical-dom',
        });
      }

      if (skipFullHtmlAssembly && segmentPatches?.length) {
        const patches = segmentPatches;
        const patchBaseline = () => {
          const patchStart = performance.now();
          let html = lastCompiledHtmlRef.current || compiledHtml;
          for (const patch of patches) {
            const next = replaceSegmentInHtml(html, patch.idx, patch.rawHtml);
            if (next) {
              html = next;
            }
          }
          lastCompiledHtmlRef.current = html;
          lastMountedHtmlRef.current = html;
          canvasDebug('baseline.idlePatch', {
            patchCount: patches.length,
            ms: performance.now() - patchStart,
          });
        };

        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(patchBaseline, { timeout: 500 });
        } else {
          setTimeout(patchBaseline, 0);
        }
      }
    }

    canvasDebug('pipeline.end', {
      runId,
      hitLevel,
      pipelineMs,
      mountMode: mountResult.mode,
      totalMs: performance.now() - pipelineStart,
      postProcessMs: mountResult.postProcessMs,
      updatedSegments: mountResult.updatedSegments,
      skippedSegments: mountResult.skippedSegments,
      source,
      directPatch: skipFullHtmlAssembly,
    });
  });
  const schedulePipeline = useMemoizedFn((source: string) => {
    pendingSourceRef.current = source;

    const delayMs = source === 'form' ? 48 : 0;
    if (scheduleDebounceRef.current) {
      window.clearTimeout(scheduleDebounceRef.current);
    }
    if (scheduleRafRef.current) {
      cancelAnimationFrame(scheduleRafRef.current);
    }

    const runScheduled = () => {
      scheduleDebounceRef.current = 0;
      scheduleRafRef.current = requestAnimationFrame(() => {
        scheduleRafRef.current = 0;
        void runPipeline(pendingSourceRef.current);
      });
    };

    if (delayMs > 0) {
      scheduleDebounceRef.current = window.setTimeout(runScheduled, delayMs);
      return;
    }

    runScheduled();
  });

  useEffect(() => {
    return form.subscribe(
      (state) => {
        latestPageDataRef.current = state.values.content ?? null;
        perfCounter('MjmlDomRender.formChange');
        schedulePipeline('form');
      },
      { values: true },
    );
  }, [form, schedulePipeline]);

  useEffect(() => {
    if (containerRef) {
      schedulePipeline('mount');
    }
  }, [containerRef, schedulePipeline]);

  useEffect(() => {
    schedulePipeline('mergeTags');
  }, [mergeTags, schedulePipeline]);

  useEffect(() => {
    return () => {
      if (scheduleDebounceRef.current) {
        window.clearTimeout(scheduleDebounceRef.current);
      }
      if (scheduleRafRef.current) {
        cancelAnimationFrame(scheduleRafRef.current);
      }
    };
  }, []);

  return (
    <div
      {...{ [DATA_RENDER_COUNT]: renderVersion }}
      data-dashed={dashed}
      ref={setContainerRef}
      style={{
        outline: 'none',
        position: 'relative',
      }}
      role="tabpanel"
      tabIndex={0}
    />
  );
}
