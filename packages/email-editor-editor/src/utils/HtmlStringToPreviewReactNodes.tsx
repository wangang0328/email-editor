import { camelCase } from 'lodash-es';
import React from 'react';
import { getNodeTypeFromClassName } from '@wa-dev/email-editor-blocks-react';
import {
  getChildSelector,
  getRenderableChildNodes,
  UNWRAP_ROOT_TAGS,
} from './htmlToReactNodeHelpers';

const domParser = new DOMParser();

export function HtmlStringToPreviewReactNodes(content: string) {
  const doc = domParser.parseFromString(content, 'text/html');

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
  const attributes: Record<string, string> = {
    'data-selector': selector,
  };
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
    return React.createElement(tagName, {
      key: index,
      ...attributes,
      dangerouslySetInnerHTML: { __html: element.textContent },
    });
  }

  if (attributes['data-contenteditable'] === 'true') {
    return React.createElement(tagName, {
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

  return React.createElement(tagName, {
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
