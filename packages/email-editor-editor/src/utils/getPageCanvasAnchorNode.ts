import {
  getNodeIdxClassName,
  getNodeTypeClassName,
  getPageIdx,
  BasicType,
} from '@wa-dev/email-editor-blocks-react';
import { DATA_RENDER_COUNT } from '@/constants';
import { getBlockNodeByIdx } from './getBlockNodeByIdx';
import { getShadowRoot } from './getShadowRoot';

const SKIP_CANVAS_CHILD_TAGS = new Set(['STYLE', 'META', 'LINK', 'TITLE']);

/**
 * 编辑画布中 page 的可视锚点（mj-body / node-idx-content）。
 * 优先用带 node-idx 的块根，避免误选 <style> 或错误 fallback。
 */
export function getPageCanvasAnchorNode(): HTMLElement | null {
  const pageIdx = getPageIdx();

  const byIdx = getBlockNodeByIdx(pageIdx);
  if (byIdx) {
    return byIdx;
  }

  const shadow = getShadowRoot();
  if (!shadow) {
    return null;
  }

  const pageIdxClass = getNodeIdxClassName(pageIdx);
  const pageTypeClass = getNodeTypeClassName(BasicType.PAGE);

  const byPageType = shadow.querySelector(`.${pageTypeClass}.${pageIdxClass}`);
  if (byPageType instanceof HTMLElement) {
    return byPageType;
  }

  const byPageTypeOnly = shadow.querySelector(`.${pageTypeClass}`);
  if (byPageTypeOnly instanceof HTMLElement) {
    return byPageTypeOnly;
  }

  const byIdxClass = shadow.querySelector(`.${pageIdxClass}`);
  if (byIdxClass instanceof HTMLElement) {
    return byIdxClass;
  }

  const mjBody = shadow.querySelector('.mj-body');
  if (mjBody instanceof HTMLElement) {
    return mjBody;
  }

  const mjmlBody = shadow.querySelector('.mjml-body');
  if (mjmlBody instanceof HTMLElement) {
    return mjmlBody;
  }

  const canvasRoot = shadow.querySelector(`[${DATA_RENDER_COUNT}]`);
  if (canvasRoot) {
    for (const child of canvasRoot.children) {
      if (
        child instanceof HTMLElement &&
        !SKIP_CANVAS_CHILD_TAGS.has(child.tagName)
      ) {
        return child;
      }
    }
  }

  return null;
}
