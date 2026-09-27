import React from 'react';

/** Parents that must not receive whitespace-only text nodes (HTML table model). */
const TABLE_LAYOUT_PARENT_TAGS = new Set([
  'table',
  'tbody',
  'thead',
  'tfoot',
  'tr',
  'colgroup',
  'col',
]);

/** Do not mount document roots in React — render children only. */
export const UNWRAP_ROOT_TAGS = new Set(['html', 'head', 'body']);

export function getChildSelector(selector: string, index: number) {
  return `${selector}-${index}`;
}

export function shouldOmitChild(parentTagName: string, child: ChildNode): boolean {
  if (child.nodeType === Node.COMMENT_NODE) {
    return true;
  }

  if (child.nodeType === Node.ELEMENT_NODE) {
    return (child as Element).tagName.toLowerCase() === 'meta';
  }

  if (child.nodeType === Node.TEXT_NODE) {
    const text = child.textContent ?? '';
    if (!text.trim()) {
      return (
        TABLE_LAYOUT_PARENT_TAGS.has(parentTagName) ||
        parentTagName === 'html' ||
        parentTagName === 'head' ||
        parentTagName === 'body'
      );
    }
  }

  return false;
}

export function getRenderableChildNodes(
  parent: Node,
  parentTagName: string,
): ChildNode[] {
  const nodes: ChildNode[] = [];
  parent.childNodes.forEach((child) => {
    if (!shouldOmitChild(parentTagName, child)) {
      nodes.push(child);
    }
  });
  return nodes;
}
