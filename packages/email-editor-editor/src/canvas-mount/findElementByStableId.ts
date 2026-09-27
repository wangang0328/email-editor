import { getNodeTypeFromClassName } from '@wa-dev/email-editor-blocks-react';
import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import { SEGMENT_BLOCK_TYPES } from '@/render-cache/constants';

/** 在容器子树内按 data-ee-uid 查找元素 */
export function findElementByStableIdInRoot(
  root: ParentNode,
  stableId: string,
  segmentRootOnly = false,
): Element | null {
  const candidates = root.querySelectorAll(`[${EE_UID_ATTR}]`);

  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i];
    if (el.getAttribute(EE_UID_ATTR) !== stableId) {
      continue;
    }

    if (!segmentRootOnly) {
      return el;
    }

    const type = getNodeTypeFromClassName(el.classList);
    if (type && SEGMENT_BLOCK_TYPES.has(type)) {
      return el;
    }
  }

  return null;
}

/** 收集画布中 segment 根节点的 eeUid 顺序（文档序） */
export function collectSegmentStableIdsInDomOrder(container: HTMLElement): string[] {
  const result: string[] = [];

  container.querySelectorAll(`[${EE_UID_ATTR}]`).forEach((el) => {
    const type = getNodeTypeFromClassName(el.classList);
    if (!type || !SEGMENT_BLOCK_TYPES.has(type)) {
      return;
    }

    const uid = el.getAttribute(EE_UID_ATTR);
    if (uid) {
      result.push(uid);
    }
  });

  return result;
}
