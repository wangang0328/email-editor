import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import { getBlockNodeByIdx } from './getBlockNodeByIdx';
import { resolveBlockIdxFromElement } from './blockDom';

/**
 * 从点击/hover 目标向上，取最近（最内层）块根。
 * 身份只认 data-ee-uid + registry；不读可能过期的 node-idx class。
 */
export const getBlockNodeByChildEle = (
  target?: Element | null,
): HTMLElement | null => {
  if (!target) {
    return null;
  }

  const withUid = target.closest(`[${EE_UID_ATTR}]`);
  if (withUid instanceof HTMLElement) {
    const idx = resolveBlockIdxFromElement(withUid);
    if (idx) {
      return getBlockNodeByIdx(idx) ?? withUid;
    }
    // uid 在、registry 未就绪：仍返回带 uid 的块根，调用方勿用 node-idx 解析
    return (withUid.closest('.email-block') as HTMLElement | null) ?? withUid;
  }

  return target.closest('.email-block') as HTMLElement | null;
};
