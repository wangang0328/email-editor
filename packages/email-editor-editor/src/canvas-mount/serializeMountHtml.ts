import { getRenderableChildNodes } from '@/utils/htmlToReactNodeHelpers';

/**
 * 将已标注的 Document 序列化为可写入画布容器的 HTML 字符串。
 *
 * 与 HtmlStringToReactNodes 的挂载结构一致：不生成 html/head/body 外壳，
 * 仅拼接 head 与 body 下可渲染子节点的 outerHTML（style、邮件正文等并列）。
 */
export function serializeMountHtml(doc: Document): string {
  const parts: string[] = [];

  appendRenderableNodes(doc.head, 'head', parts);
  appendRenderableNodes(doc.body, 'body', parts);

  return parts.join('');
}

function appendRenderableNodes(parent: Node, parentTagName: string, parts: string[]): void {
  getRenderableChildNodes(parent, parentTagName).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      parts.push((node as Element).outerHTML);
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text.trim()) {
        parts.push(text);
      }
    }
  });
}
