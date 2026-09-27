import {
  getNodeIdxClassName,
  getNodeIdxFromClassName,
} from '@wa-dev/email-editor-blocks-react';
import { findElementByNodeIdxInRoot } from '@/canvas-mount/findElementByNodeIdx';
import { getBlockNodeByUid, resolveUidFromIdx } from './blockDom';
import { getBlockNodes } from './getBlockNodes';
import { getShadowRoot } from './getShadowRoot';

function isMatchingBlockNode(node: Element | null, idx: string): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    getNodeIdxFromClassName(node.classList) === idx
  );
}

/**
 * 按 focusIdx / hoverIdx 查找块根 DOM。
 * 优先 uid（registry + data-ee-uid），回退 node-idx class。
 */
export const getBlockNodeByIdx = (idx: string): HTMLElement | null => {
  if (!idx) {
    return null;
  }

  const uid = resolveUidFromIdx(idx);
  if (uid) {
    const byUid = getBlockNodeByUid(uid);
    if (byUid) {
      return byUid;
    }
  }

  const targetClass = getNodeIdxClassName(idx);

  const fromEmailBlock = getBlockNodes().find((item) =>
    item.classList.contains(targetClass),
  );
  if (fromEmailBlock instanceof HTMLElement && isMatchingBlockNode(fromEmailBlock, idx)) {
    return fromEmailBlock;
  }

  const shadow = getShadowRoot();
  if (!shadow) {
    return null;
  }

  const fromNodeIdx = findElementByNodeIdxInRoot(shadow, idx);
  if (isMatchingBlockNode(fromNodeIdx, idx)) {
    return fromNodeIdx;
  }

  return null;
};
