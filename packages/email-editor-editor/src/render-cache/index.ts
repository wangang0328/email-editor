/**
 * 邮件编辑器渲染缓存模块
 *
 * @see compileWithRenderCache — 统一编译入口
 * @see getRenderCacheManager — L1/L2/L3 存储与统计
 */
export type {
  CompilePipelineInput,
  CompilePipelineResult,
  DomPreserveSnapshot,
  RenderCacheHitLevel,
  RenderCacheKeyInput,
  RenderCacheStats,
  RenderProfile,
  RenderSegment,
  SegmentDirectPatch,
} from './types';

export { RENDER_ENGINE_VERSION } from './constants';
export { stableStringify, hashString, hashBlockSubtree, buildPageCacheKey } from './hash';
export { collectRenderSegments } from './segments';
export { extractSegmentOuterHtml, replaceSegmentInHtml } from './htmlSegments';
export { assembleFromSegmentCache } from './segmentAssembly';
export { getRenderCacheManager, RenderCacheManager } from './RenderCacheManager';
export { compileWithRenderCache, fullCompileToHtml } from './compilePipeline';
export {
  compileWithRenderCacheAsync,
  cancelPendingCompileJobs,
  isCompileJobCancelled,
  isCompileWorkerAvailable,
  registerCompileWorkerFactory,
} from './compileWorkerClient';
