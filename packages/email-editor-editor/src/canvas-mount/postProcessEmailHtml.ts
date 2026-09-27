import { MERGE_TAG_CLASS_NAME } from '@wa-dev/email-editor-blocks-react';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { buildIdxToStableIdMap, ensurePageBlockStableIds } from '@wa-dev/email-editor-shared';
import { MergeTagBadge } from '@/utils/MergeTagBadge';
import { annotateDocumentForEditCanvas } from './annotateDocument';
import { findElementByNodeIdxInDocument } from './findElementByNodeIdx';
import { serializeMountHtml } from './serializeMountHtml';
import type { PostProcessEmailHtmlOptions, PostProcessResult } from './types';

const domParser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;

/**
 * 对已解析的 Document 执行编辑画布后处理（原地修改）。
 * HtmlStringToReactNodes 过渡期复用，保证与直接 DOM 挂载行为一致。
 */
export function postProcessDocument(
  doc: Document,
  options: PostProcessEmailHtmlOptions,
  pageData?: IBlockData,
): void {
  applyLinkTabIndex(doc);
  applyMergeTagBadges(doc, options.enabledMergeTagsBadge);
  const idxToStableId = pageData ? buildIdxToStableIdMap(pageData) : undefined;
  annotateDocumentForEditCanvas(doc, idxToStableId);
}

/**
 * 编辑画布 HTML 后处理（从 HtmlStringToReactNodes 抽离）。
 *
 * 职责：
 * 1. 链接 tabIndex=-1，避免抢走块选中焦点
 * 2. 合并标签 Badge 转换（可选）
 * 3. 注入 data-selector、contenteditable、块导航属性
 * 4. 序列化为可直接 innerHTML 的挂载字符串
 *
 * 不做 React.createElement，供 EditCanvasMount 直接写 Shadow DOM。
 */
export function postProcessEmailHtml(
  rawHtml: string,
  options: PostProcessEmailHtmlOptions,
  pageData?: IBlockData,
): PostProcessResult {
  if (!domParser) {
    return { mountHtml: rawHtml, document: createEmptyDocument() };
  }

  if (pageData) {
    ensurePageBlockStableIds(pageData);
  }

  const doc = domParser.parseFromString(rawHtml, 'text/html');
  postProcessDocument(doc, options, pageData);

  return {
    mountHtml: serializeMountHtml(doc),
    document: doc,
  };
}

/**
 * 仅对单段 outerHTML 做后处理（段级挂载热路径）。
 * 改 section 背景色等场景避免整页 postProcess。
 */
export function postProcessSegmentOuterHtml(
  segmentOuterHtml: string,
  segmentIdx: string,
  options: PostProcessEmailHtmlOptions,
  pageData?: IBlockData,
): string | null {
  if (!domParser || !segmentOuterHtml) {
    return segmentOuterHtml || null;
  }

  const doc = domParser.parseFromString(
    `<!DOCTYPE html><html><head></head><body>${segmentOuterHtml}</body></html>`,
    'text/html',
  );
  postProcessDocument(doc, options, pageData);

  return findElementByNodeIdxInDocument(doc, segmentIdx)?.outerHTML ?? null;
}

/** 供单测或降级：无 DOMParser 时返回空文档 */
function createEmptyDocument(): Document {
  if (typeof document !== 'undefined') {
    return document.implementation.createHTMLDocument('');
  }
  return {} as Document;
}

/** 防止画布内 <a> 在 Tab 导航时抢走焦点 */
function applyLinkTabIndex(doc: Document): void {
  [...doc.getElementsByTagName('a')].forEach((node) => {
    node.setAttribute('tabindex', '-1');
  });
}

/** 编辑态将 {{ mergeTag }} 渲染为可识别 Badge */
function applyMergeTagBadges(doc: Document, enabled: boolean): void {
  if (!enabled) {
    return;
  }

  [...doc.querySelectorAll(`.${MERGE_TAG_CLASS_NAME}`)].forEach((child) => {
    const editNode = child.querySelector('div');
    if (editNode) {
      editNode.innerHTML = MergeTagBadge.transform(editNode.innerHTML);
    }
  });
}
