export const EMAIL_EDITOR_SHARED_VERSION = '1.0.3';

export { classnames } from './classnames';
export * from './constants/image-default';
export * from './constants/default-image-urls';

export * from './types';
export * from './tree';
export {
  EE_UID_ATTR,
  EE_UID_DATA_PATH,
  buildIdxToStableIdMap,
  createBlockStableId,
  ensureBlockStableId,
  ensurePageBlockStableIds,
  getBlockStableId,
  pageDataNeedsStableIds,
} from './stableId';
export { BlockIndexRegistry } from './blockIndex';
export type { BlockIndexEntry } from './blockIndex';
export { mergeBlock } from './merge-block';
export { isValidBlockDataShape } from './is-valid-block-data';
export { isPanelDebugEnabled, panelDebug, panelDebugHintOnce } from './debug/panelDebug';
export {
  canvasDebug,
  canvasDebugHintOnce,
  isCanvasDebugEnabled,
} from './debug/canvasDebug';
export {
  isPerfDebugEnabled,
  perfCounter,
  perfDebugHintOnce,
  perfRecord,
  perfReport,
  perfReportInitialRender,
  perfResetSession,
  perfTime,
} from './debug/perfDebug';
export type { PerfEntry, PerfMetrics } from './debug/perfDebug';
