export * from './plugins/standard';
export * from './plugins/advanced';
export { default as MjmlBlock } from './mjml/MjmlBlock';
export { BlockRenderer } from './mjml/BlockRenderer';
export { BasicBlock } from './mjml/BasicBlock';
export type { MjmlBlockProps } from './mjml/MjmlBlock';
/** MJML core: `MjmlBlock`, `BlockRenderer`, `BasicBlock` */
export * as mjml from './mjml';
/**
 * @deprecated Removed legacy `mjml/jsx` builders. Use `MjmlBlock`, `BlockRenderer`, or `*Definition.create()`.
 * Alias kept temporarily; only re-exports `mjml` core.
 */
export * as components from './mjml';
export { standardBlocksPlugin } from './plugins/standardBlocksPlugin';
export { buttonDefinition } from './plugins/standard/button';
export type { IButton } from './plugins/standard/button/schema';
export type { BlockDefinition } from './plugins/types';
export { defineBlock } from './plugins/defineBlock';
export { createBlock } from './utils/createBlock';
export { createCustomBlock } from './utils/createCustomBlock';
export { TemplateEngineManager } from './utils/TemplateEngineManager';
export { getPreviewClassName } from './utils/getPreviewClassName';
export { getAdapterAttributesString } from './utils/getAdapterAttributesString';
export { ImageManager } from './utils/ImageManager';
export { getImg } from './utils/getImg';
export {
  EmailRenderProvider,
  useEmailRenderContext,
} from './render/context';
export type { EmailRenderProps } from './render/context';
export type { IBlock, IBlockData, RecursivePartial } from './typings';

export { ensureDefaultEngineBlocks } from './bootstrap/ensureDefaultEngineBlocks';
export {
  getBlocks,
  registerBlocks,
  getBlockByType,
  getAutoCompletePath,
} from './blockRegistry';
export { JsonToMjml } from './JsonToMjml';
export { parseReactBlockToBlockData } from './parseReactBlockToBlockData';
export { createBlockDataByType } from './createBlockDataByType';
export { ancestorOf } from './ancestorOf';
export { isValidBlockData } from './isValidBlockData';
export { isAdvancedBlock } from './isAdvancedBlock';
export { getSameParent, getValidChildBlocks } from './block';
export {
  BasicType,
  AdvancedType,
  EMAIL_BLOCK_CLASS_NAME,
  MERGE_TAG_CLASS_NAME,
} from '@wa-dev/email-editor-shared/types';

export type { BlockType } from '@wa-dev/email-editor-shared/types';

export {
  getPageIdx,
  getChildIdx,
  getParentIdx,
  getSiblingIdx,
  getParentByIdx,
  mergeBlock,
  isValidBlockDataShape,
} from '@wa-dev/email-editor-shared';

export { isProductionMode } from './jsonToMjmlOptions';

export type {
  JsonToMjmlOption,
  JsonToMjmlOptionDev,
  JsonToMjmlOptionProduction,
} from './jsonToMjmlOptions';

export {
  getNodeIdxClassName,
  getNodeTypeClassName,
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
  getIndexByIdx,
  getValueByIdx,
  getParentByType,
  getParenRelativeByType,
} from './block';
