import { getNodeIdxClassName } from '@wa-dev/email-editor-shared';

/**
 * 在任意父节点子树内按 node-idx class 查找块根元素。
 * idx 含 `.` `[]` 等字符，使用 classList 精确匹配而非 CSS 选择器转义。
 */
export function findElementByNodeIdxInRoot(root: ParentNode, segmentIdx: string): Element | null {
  const targetClass = getNodeIdxClassName(segmentIdx);
  const candidates = root.querySelectorAll('[class*="node-idx-"]');

  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i];
    if (el.classList.contains(targetClass)) {
      return el;
    }
  }

  return null;
}

/** 在已解析的 HTML Document 中查找段根节点 */
export function findElementByNodeIdxInDocument(doc: Document, segmentIdx: string): Element | null {
  return findElementByNodeIdxInRoot(doc, segmentIdx);
}
