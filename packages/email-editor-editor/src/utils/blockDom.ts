import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import { findElementByStableIdInRoot } from '@/canvas-mount/findElementByStableId';
import { idxToUid, uidToIdx } from '@/block-index/blockIndexStore';
import { getShadowRoot } from './getShadowRoot';

export { getBlockUidFromElement, uidToIdx, idxToUid } from '@/block-index/blockIndexStore';

export function getBlockNodeByUid(uid: string): HTMLElement | null {
  if (!uid) {
    return null;
  }

  const shadow = getShadowRoot();
  if (!shadow) {
    return null;
  }

  const el = findElementByStableIdInRoot(shadow, uid, false);
  return el instanceof HTMLElement ? el : null;
}

/** 从 DOM 元素解析当前 idx（优先 uid → registry，不读可能过期的 node-idx class） */
export function resolveBlockIdxFromElement(element: Element | null): string | null {
  if (!element) {
    return null;
  }

  const uid = element.closest(`[${EE_UID_ATTR}]`)?.getAttribute(EE_UID_ATTR);
  if (uid) {
    const idx = uidToIdx(uid);
    if (idx) {
      return idx;
    }
  }

  return null;
}

/** 从 focusIdx 解析 uid */
export function resolveUidFromIdx(idx: string): string | null {
  return idx ? idxToUid(idx) : null;
}

/** 判断 DOM 节点是否对应当前 idx（只认 uid，不读过期 node-idx） */
export function isBlockNodeForIdx(node: Element | null, idx: string): boolean {
  if (!(node instanceof HTMLElement) || !idx) {
    return false;
  }

  const uid = resolveUidFromIdx(idx);
  if (!uid) {
    return false;
  }

  const nodeUid =
    node.getAttribute(EE_UID_ATTR) ??
    node.closest(`[${EE_UID_ATTR}]`)?.getAttribute(EE_UID_ATTR);
  return nodeUid === uid;
}
