import { camelCase } from 'lodash-es';
import React from 'react';
import { postProcessDocument } from '@/canvas-mount/postProcessEmailHtml';
import {
  getChildSelector,
  getRenderableChildNodes,
  UNWRAP_ROOT_TAGS,
} from './htmlToReactNodeHelpers';

const domParser = new DOMParser();

/**
 * 编辑画布：mjml-browser 输出的 HTML 字符串 → 可交互 React 树。
 *
 * @deprecated 编辑 Tab 已改用 canvas-mount 直接 DOM 挂载；本模块保留供预览过渡期或对照。
 *
 * ## 后处理逻辑
 *
 * 与 `postProcessEmailHtml` 共用 `postProcessDocument`，保证 contenteditable、
 * data-selector、merge tag Badge 等行为与直接 DOM 挂载一致。
 *
 * @see canvas-mount/EditCanvasMount — 编辑 Tab 推荐挂载路径
 * @see HtmlStringToPreviewReactNodes — 预览只读版本
 */
export interface HtmlStringToReactNodesOptions {
  enabledMergeTagsBadge: boolean;
}

export function HtmlStringToReactNodes(
  content: string,
  option: HtmlStringToReactNodesOptions,
) {
  const doc = domParser.parseFromString(content, 'text/html');
  postProcessDocument(doc, option);

  return (
    <>
      {renderChildNodes(doc.head, 'head', 'head')}
      {renderChildNodes(doc.body, 'body', 'body')}
    </>
  );
}

function renderChildNodes(
  parent: Node,
  selector: string,
  parentTagName: string,
): React.ReactNode[] {
  return getRenderableChildNodes(parent, parentTagName).map((child, i) => (
    <RenderReactNode
      key={`${selector}-${i}`}
      selector={getChildSelector(selector, i)}
      node={child}
      index={i}
    />
  ));
}

const RenderReactNode = React.memo(function RenderReactNode({
  node,
  index,
  selector,
}: {
  node: Node;
  index: number;
  selector: string;
}): React.ReactElement {
  if (node.nodeType === Node.COMMENT_NODE) {
    return <></>;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (!text.trim()) {
      return <></>;
    }
    return <>{text}</>;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return <></>;
  }

  const element = node as HTMLElement;
  const attributes: Record<string, string> = {};
  element.getAttributeNames?.().forEach((att) => {
    if (att) {
      attributes[att] = element.getAttribute(att) || '';
    }
  });

  const tagName = element.tagName.toLowerCase();
  if (tagName === 'meta') {
    return <></>;
  }

  if (tagName === 'style') {
    return createElement(tagName, {
      key: index,
      ...attributes,
      dangerouslySetInnerHTML: { __html: element.textContent },
    });
  }

  // contenteditable 节点用 innerHTML 挂载，避免 React 子节点与浏览器选区冲突
  if (attributes.contenteditable === 'true') {
    return createElement(tagName, {
      key: `ce-${selector}`,
      ...attributes,
      style: getStyle(element.getAttribute('style')),
      dangerouslySetInnerHTML: { __html: element.innerHTML },
    });
  }

  if (UNWRAP_ROOT_TAGS.has(tagName)) {
    return <>{renderChildNodes(element, selector, tagName)}</>;
  }

  const children = renderChildNodes(element, selector, tagName);

  return createElement(tagName, {
    key: index,
    ...attributes,
    style: getStyle(element.getAttribute('style')),
    children: children.length === 0 ? null : children,
  });
});

function getStyle(styleText: string | null) {
  if (!styleText) return undefined;
  return styleText.split(';').reduceRight((a: Record<string, string>, b: string) => {
    const arr = b.split(/\:(?!\/)/);
    if (arr.length < 2) return a;
    a[camelCase(arr[0])] = arr[1];
    return a;
  }, {});
}

function createElement(
  type: string,
  props?: React.ClassAttributes<Element> & {
    style?: Record<string, string>;
    children?: React.ReactNode[] | null;
    key: string | number;
    tabIndex?: string;
    class?: string;
    role?: string;
    src?: string;
    dangerouslySetInnerHTML?: { __html: string | null };
  },
) {
  if (props?.class && props.class.includes('email-block')) {
    props.key = String(props.key) + props.class;
  }

  return React.createElement(type, props);
}
