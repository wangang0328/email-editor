import { morphElementOuterHtml } from './morphDomOptions';

/**
 * 段级 in-place morph：按 data-ee-uid / data-selector 对齐节点，保留 img 等同 key 元素的 DOM identity。
 */
export function morphSegmentOuterHtml(liveNode: Element, outerHtml: string): boolean {
  return morphElementOuterHtml(liveNode, outerHtml);
}
