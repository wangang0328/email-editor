/**
 * 编辑画布 DOM 挂载模块。
 *
 * 替代 HtmlStringToReactNodes + createPortal，直接写入 Shadow DOM。
 * @see ./画布挂载说明.md — 模块设计与 API 说明
 * @see docs/编辑画布渲染优化方案.md — 方案背景与路线图
 */
export { mountEditCanvas } from './EditCanvasMount';
export { EE_CANVAS_MOUNT_EVENT, notifyCanvasMountCommit } from './canvasMountEvents';
export {
  postProcessEmailHtml,
  postProcessDocument,
  postProcessSegmentOuterHtml,
} from './postProcessEmailHtml';
export { annotateDocumentForEditCanvas } from './annotateDocument';
export { buildMountPlan, buildMountPlanWithReason, buildSegmentMountSnapshot, buildSegmentHashSnapshot, isReorderMountPlan, isZeroCompileMountPlan } from './buildMountPlan';
export { commitMountPlan } from './commitMountPlan';
export { htmlToFragment } from './htmlToFragment';
export { serializeMountHtml } from './serializeMountHtml';
export { removeSegmentDom, spliceSegmentDom } from './surgicalSegmentDom';
export {
  isZeroCompileMountMode,
  isZeroCompileDomResultMode,
} from './zeroCompileMount';
export type {
  EditCanvasMountInput,
  EditCanvasMountResult,
  PostProcessEmailHtmlOptions,
  PostProcessResult,
  SegmentMountSnapshot,
  SegmentHashSnapshot,
  SegmentMountPlan,
} from './types';
