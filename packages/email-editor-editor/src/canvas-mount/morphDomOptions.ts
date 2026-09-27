import morphdom from 'morphdom';
import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import {
  ATTR_ORIGIN,
  EDIT_CANVAS_IMAGE_FALLBACK,
  applyImageFallback,
  getImageIdentitySrc,
  isKnownFailedImageOrigin,
  rewriteKnownFailedImages,
} from './stabilizeEditCanvasImages';

type MorphDomOptions = NonNullable<Parameters<typeof morphdom>[2]>;

const ATTR_IMG_MARK = 'data-ee-img';
const ATTR_IMG_LOADED = 'data-ee-img-loaded';
const ATTR_IMG_ERROR = 'data-ee-img-error';
const ATTR_IMG_SRC = 'data-ee-img-src';

export function getMorphNodeKey(node: Node): string | undefined {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return undefined;
  }

  const el = node as Element;
  const uid = el.getAttribute(EE_UID_ATTR);
  if (uid) {
    return uid;
  }

  const selector = el.getAttribute('data-selector');
  if (selector) {
    return selector;
  }

  if (el instanceof HTMLImageElement) {
    const identity = getImageIdentitySrc(el);
    if (identity) {
      return `img:${identity}`;
    }
  }

  return undefined;
}

export function isFocusedContentEditable(el: Element): boolean {
  if (!(el instanceof HTMLElement) || el.getAttribute('contenteditable') !== 'true') {
    return false;
  }

  const root = el.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) {
    return false;
  }

  const active = root.activeElement;
  return active === el || (active instanceof Node && el.contains(active));
}

function isSameImageSource(fromEl: HTMLImageElement, toEl: HTMLImageElement): boolean {
  if (fromEl.src && toEl.src && fromEl.src === toEl.src) {
    return true;
  }
  const fromAttr = fromEl.getAttribute('src');
  const toAttr = toEl.getAttribute('src');
  if (fromAttr && fromAttr === toAttr) {
    return true;
  }

  const fromOrigin = fromEl.getAttribute(ATTR_ORIGIN);
  const toIdentity = getImageIdentitySrc(toEl);

  // 失败态 live(fallback) ↔ 内容树(原始 URL 或已 rewrite 的 fallback+origin)
  if (fromEl.getAttribute(ATTR_IMG_ERROR) === '1' && fromOrigin && toIdentity) {
    if (toIdentity === fromOrigin || toAttr === fromOrigin) {
      return true;
    }
    try {
      const resolved = new URL(fromOrigin, document.baseURI).href;
      if (toEl.src === resolved || toIdentity === resolved) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  // 双方都是已知失败同源（to 可能已被 rewrite 成 fallback）
  if (fromOrigin && toIdentity && isKnownFailedImageOrigin(fromOrigin)) {
    if (fromOrigin === toIdentity || fromOrigin === toEl.getAttribute(ATTR_ORIGIN)) {
      return true;
    }
  }

  return false;
}

function syncImageSemanticAttrs(fromEl: HTMLImageElement, toEl: HTMLImageElement): void {
  const keepMinHeight = fromEl.style.minHeight;
  const isRuntimeLoading =
    fromEl.getAttribute(ATTR_IMG_MARK) === '1' &&
    fromEl.getAttribute(ATTR_IMG_LOADED) !== '1' &&
    fromEl.getAttribute(ATTR_IMG_ERROR) !== '1';
  const isRuntimeError = fromEl.getAttribute(ATTR_IMG_ERROR) === '1';

  for (const name of ['width', 'height', 'alt', 'title', 'class'] as const) {
    const next = toEl.getAttribute(name);
    const prev = fromEl.getAttribute(name);
    if (next === prev) {
      continue;
    }
    if (next == null) {
      fromEl.removeAttribute(name);
    } else {
      fromEl.setAttribute(name, next);
    }
  }

  if (isRuntimeError) {
    const toOrigin =
      toEl.getAttribute(ATTR_ORIGIN) ||
      (toEl.getAttribute('src') !== EDIT_CANVAS_IMAGE_FALLBACK
        ? toEl.getAttribute('src')
        : null);
    if (toOrigin && toOrigin !== EDIT_CANVAS_IMAGE_FALLBACK) {
      fromEl.setAttribute(ATTR_ORIGIN, toOrigin);
    }
    return;
  }

  if (isRuntimeLoading && keepMinHeight) {
    fromEl.style.minHeight = keepMinHeight;
  }
}

function onBeforeElUpdated(fromEl: Element, toEl: Element): boolean {
  if (isFocusedContentEditable(fromEl)) {
    return false;
  }

  if (fromEl instanceof HTMLImageElement && toEl instanceof HTMLImageElement) {
    if (isSameImageSource(fromEl, toEl)) {
      syncImageSemanticAttrs(fromEl, toEl);
      return false;
    }

    fromEl.removeAttribute(ATTR_IMG_LOADED);
    fromEl.removeAttribute(ATTR_IMG_ERROR);
    fromEl.removeAttribute(ATTR_IMG_SRC);
    fromEl.removeAttribute(ATTR_ORIGIN);
    return true;
  }

  return true;
}

/** 新节点挂入前兜底：避免漏网的坏链 src 触发请求 */
function onBeforeNodeAdded(node: Node): Node {
  if (node instanceof HTMLImageElement) {
    const src = node.getAttribute('src') || '';
    if (src && isKnownFailedImageOrigin(src)) {
      applyImageFallback(node, src);
    }
  } else if (node instanceof Element) {
    rewriteKnownFailedImages(node);
  }
  return node;
}

export function createMorphDomOptions(
  overrides?: Partial<MorphDomOptions>,
): MorphDomOptions {
  return {
    getNodeKey: getMorphNodeKey,
    onBeforeElUpdated,
    onBeforeNodeAdded,
    ...overrides,
  };
}

export function morphElementOuterHtml(liveNode: Element, outerHtml: string): boolean {
  const template = document.createElement('template');
  template.innerHTML = outerHtml.trim();
  const newRoot = template.content.firstElementChild;

  if (!newRoot || liveNode.tagName !== newRoot.tagName) {
    return false;
  }

  // 先改写目标树，再 morph，避免新增/替换节点时浏览器请求坏链
  rewriteKnownFailedImages(template.content);
  morphdom(liveNode, newRoot, createMorphDomOptions({ childrenOnly: false }));
  return true;
}

export function morphContainerChildren(liveContainer: HTMLElement, mountHtml: string): boolean {
  const template = document.createElement('template');
  template.innerHTML = mountHtml.trim();

  const tempContainer = document.createElement('div');
  while (template.content.firstChild) {
    tempContainer.appendChild(template.content.firstChild);
  }

  rewriteKnownFailedImages(tempContainer);

  try {
    morphdom(liveContainer, tempContainer, createMorphDomOptions({ childrenOnly: true }));
  } catch (err) {
    const maybeDomException = err as { name?: string; message?: string } | null;
    if (maybeDomException?.name === 'NotFoundError') {
      rewriteKnownFailedImages(tempContainer);
      liveContainer.replaceChildren(...Array.from(tempContainer.childNodes));
      return true;
    }
    throw err;
  }
  return true;
}
