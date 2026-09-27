import {
  BasicType,
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
} from '@wa-dev/email-editor-blocks-react';
import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import {
  getChildSelector,
  getRenderableChildNodes,
} from '@/utils/htmlToReactNodeHelpers';
import { markBlockContentEditable, markStandardContentEditable } from './contentEditableMarkers';

export type IdxToStableIdMap = ReadonlyMap<string, string>;

/**
 * 为文档树注入编辑画布所需的 DOM 标注。
 *
 * 与 HtmlStringToReactNodes 的 RenderReactNode 行为对齐：
 * - data-selector：SyncScrollShadowDom 滚动位置恢复
 * - data-ee-uid：morphdom reconciler key（结构变更时复用 DOM）
 * - node-idx / contenteditable：选中、内联编辑、工具栏定位
 * - email-block role=tab：非 Text 块键盘导航
 */
export function annotateDocumentForEditCanvas(
  doc: Document,
  idxToStableId?: IdxToStableIdMap,
): void {
  getRenderableChildNodes(doc.head, 'head').forEach((child, index) => {
    walkAndAnnotate(child, getChildSelector('head', index), 'head', idxToStableId);
  });
  getRenderableChildNodes(doc.body, 'body').forEach((child, index) => {
    walkAndAnnotate(child, getChildSelector('body', index), 'body', idxToStableId);
  });
}

function walkAndAnnotate(
  node: ChildNode,
  selector: string,
  parentTagName: string,
  idxToStableId?: IdxToStableIdMap,
): void {
  if (node.nodeType === Node.COMMENT_NODE) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'meta') {
    return;
  }

  element.setAttribute('data-selector', selector);

  const blockType = getNodeTypeFromClassName(element.classList);
  const idx = getNodeIdxFromClassName(element.classList);

  if (idx && idxToStableId?.has(idx)) {
    element.setAttribute(EE_UID_ATTR, idxToStableId.get(idx)!);
  }

  if (blockType) {
    if (idx) {
      markStandardContentEditable(element, blockType, idx);
    }
    markBlockContentEditable(element);
  }

  applyBlockTabNavigation(element);

  const children = getRenderableChildNodes(element, tagName);
  children.forEach((child, index) => {
    walkAndAnnotate(child, getChildSelector(selector, index), tagName, idxToStableId);
  });
}

/** 非 Text 的 email-block 作为可聚焦 tab，服务键盘导航 */
function applyBlockTabNavigation(element: HTMLElement): void {
  const className = element.getAttribute('class') ?? '';
  if (!className.includes('email-block')) {
    return;
  }

  const blockType = getNodeTypeFromClassName(element.classList);
  if (!blockType || blockType === BasicType.TEXT) {
    return;
  }

  element.setAttribute('role', 'tab');
  element.setAttribute('tabindex', '0');
}
