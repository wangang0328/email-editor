import {
  EE_UID_ATTR,
  getNodeIdxClassName,
  type BlockIndexRegistry,
} from '@wa-dev/email-editor-shared';
import {
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_FIELD,
} from '@/constants';
import { getContentEditableIdx } from '@/utils/contenteditable';
import { rewritePathWithNewBlockIdx } from '@/utils/contentEditableFormPath';

export { rewritePathWithNewBlockIdx } from '@/utils/contentEditableFormPath';

const NODE_IDX_PREFIX = 'node-idx-';
const CONTENT_EDITABLE_IDX_PREFIX = 'node-contenteditable-idx-';

/**
 * 按 registry 的 uid→idx 重写 live DOM 上的 node-idx / contenteditable 路径。
 * 用于同父 reorder 零编译后纠正标注，避免「文本写到错误块」。
 *
 * 不改 data-ee-uid、不改 HTML 内容，只改 idx 相关 class / data 属性。
 */
export function reannotateSubtreeByRegistry(
  root: ParentNode,
  registry: BlockIndexRegistry,
): number {
  const blocks = root.querySelectorAll(`[${EE_UID_ATTR}]`);
  let updated = 0;

  blocks.forEach(node => {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    const uid = node.getAttribute(EE_UID_ATTR);
    if (!uid) {
      return;
    }
    const newIdx = registry.uidToIdx(uid);
    if (!newIdx) {
      return;
    }

    rewriteNodeIdxClass(node, newIdx);
    rewriteOwnedContentEditableMarkers(node, uid, newIdx);
    updated += 1;
  });

  return updated;
}

function rewriteNodeIdxClass(el: HTMLElement, newIdx: string): void {
  const next = getNodeIdxClassName(newIdx);
  Array.from(el.classList).forEach(className => {
    if (className.startsWith(NODE_IDX_PREFIX) && className !== next) {
      el.classList.remove(className);
    }
  });
  if (!el.classList.contains(next)) {
    el.classList.add(next);
  }
}

function rewriteOwnedContentEditableMarkers(
  blockEl: HTMLElement,
  uid: string,
  newIdx: string,
): void {
  const candidates: Element[] = [blockEl, ...Array.from(blockEl.querySelectorAll('*'))];

  for (const node of candidates) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    if (!isOwnedByBlock(node, blockEl, uid)) {
      continue;
    }

    const field = node.getAttribute(DATA_CONTENT_FIELD);
    const attrPath = node.getAttribute(DATA_CONTENT_EDITABLE_IDX);
    const classPath = findContentEditableIdxClass(node);

    if (!field && !attrPath && !classPath) {
      continue;
    }

    const newPath = field
      ? `${newIdx}.${field}`
      : rewritePathWithNewBlockIdx(attrPath || classPath || '', newIdx);

    if (!newPath) {
      continue;
    }

    if (attrPath != null || field) {
      node.setAttribute(DATA_CONTENT_EDITABLE_IDX, newPath);
    }

    if (classPath) {
      const nextClass = getContentEditableIdx(newPath);
      Array.from(node.classList).forEach(className => {
        if (
          className.startsWith(CONTENT_EDITABLE_IDX_PREFIX) &&
          className !== nextClass
        ) {
          node.classList.remove(className);
        }
      });
      if (!node.classList.contains(nextClass)) {
        node.classList.add(nextClass);
      }
    }
  }
}

function isOwnedByBlock(
  node: Element,
  blockEl: HTMLElement,
  uid: string,
): boolean {
  const nearest = node.closest(`[${EE_UID_ATTR}]`);
  if (!nearest) {
    return false;
  }
  return nearest === blockEl || nearest.getAttribute(EE_UID_ATTR) === uid;
}

function findContentEditableIdxClass(el: HTMLElement): string | null {
  for (const className of Array.from(el.classList)) {
    if (className.startsWith(CONTENT_EDITABLE_IDX_PREFIX)) {
      return className.slice(CONTENT_EDITABLE_IDX_PREFIX.length);
    }
  }
  return null;
}
