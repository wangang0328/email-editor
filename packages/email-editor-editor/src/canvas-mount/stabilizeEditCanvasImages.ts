const ATTR_MARK = 'data-ee-img';
const ATTR_LOADED = 'data-ee-img-loaded';
const ATTR_ERROR = 'data-ee-img-error';
/** 当前展示用 src（成功为原图；失败为 fallback data URL） */
const ATTR_SRC = 'data-ee-img-src';
/** 内容里的原始 src；失败后 live.src 已是 fallback，morph 用此对齐身份，避免重请求 */
export const ATTR_ORIGIN = 'data-ee-img-origin';

/** morph 可能清掉 data-*，用 WeakSet 避免重复绑定 load/error */
const boundImages = new WeakSet<HTMLImageElement>();

/**
 * 会话内已知失败的原始 URL（含 resolve 后绝对地址）。
 * 拖动/morph 若换新 img 节点，插入前据此改写为 fallback，避免浏览器再次请求坏链。
 */
const failedImageOrigins = new Set<string>();

/** 加载失败兜底图：固定宽高，避免 broken icon 再塌一次布局 */
export const EDIT_CANVAS_IMAGE_FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
      <rect width="400" height="240" fill="#f2f3f5"/>
      <g fill="none" stroke="#c9cdd4" stroke-width="2">
        <rect x="150" y="70" width="100" height="80" rx="4"/>
        <circle cx="178" cy="98" r="10"/>
        <path d="M150 130l30-24 20 16 20-28 30 36H150z"/>
      </g>
      <text x="200" y="180" text-anchor="middle" fill="#86909c" font-size="13" font-family="sans-serif">图片加载失败</text>
    </svg>`.replace(/\s+/g, ' ').trim(),
  );

export function isFallbackSrc(src: string): boolean {
  return src.startsWith('data:image/svg+xml');
}

function originKeys(src: string): string[] {
  if (!src || isFallbackSrc(src)) {
    return [];
  }
  const keys = [src];
  try {
    keys.push(new URL(src, typeof document !== 'undefined' ? document.baseURI : undefined).href);
  } catch {
    // ignore
  }
  return keys;
}

export function markImageOriginFailed(src: string): void {
  for (const key of originKeys(src)) {
    failedImageOrigins.add(key);
  }
}

export function isKnownFailedImageOrigin(src: string): boolean {
  return originKeys(src).some((key) => failedImageOrigins.has(key));
}

/** 测试用：清空失败缓存 */
export function clearFailedImageOriginCache(): void {
  failedImageOrigins.clear();
}

function parsePxSize(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'auto') return null;
  const px = Number.parseFloat(trimmed);
  return Number.isFinite(px) && px > 0 ? px : null;
}

function reserveLoadingSpace(img: HTMLImageElement): void {
  if (img.getAttribute(ATTR_LOADED) === '1' || img.getAttribute(ATTR_ERROR) === '1') {
    return;
  }

  const width =
    parsePxSize(img.getAttribute('width')) ??
    parsePxSize(img.style.width);

  if (width && width <= 64) {
    img.style.minHeight = `${Math.round(width)}px`;
    return;
  }

  if (width) {
    img.style.minHeight = `${Math.round(Math.min(240, Math.max(80, width * 0.35)))}px`;
    return;
  }

  img.style.minHeight = '80px';
}

function clearLoadingSpace(img: HTMLImageElement): void {
  img.style.minHeight = '';
}

function markLoaded(img: HTMLImageElement): void {
  img.setAttribute(ATTR_LOADED, '1');
  img.removeAttribute(ATTR_ERROR);
  clearLoadingSpace(img);
}

function rememberOrigin(img: HTMLImageElement, src: string): void {
  if (!src || isFallbackSrc(src)) {
    return;
  }
  img.setAttribute(ATTR_ORIGIN, src);
}

/**
 * 将 img 切到失败兜底（可对尚未标记 error 的新节点调用）。
 * @param originSrc 内容原始 URL；缺省则读当前 src
 */
export function applyImageFallback(img: HTMLImageElement, originSrc?: string): void {
  const failingSrc =
    originSrc ||
    img.getAttribute(ATTR_ORIGIN) ||
    img.getAttribute('src') ||
    '';

  if (failingSrc && !isFallbackSrc(failingSrc)) {
    rememberOrigin(img, failingSrc);
    markImageOriginFailed(failingSrc);
  }

  if (
    img.getAttribute(ATTR_ERROR) === '1' &&
    isFallbackSrc(img.getAttribute('src') || '')
  ) {
    return;
  }

  img.setAttribute(ATTR_MARK, '1');
  img.setAttribute(ATTR_ERROR, '1');
  img.removeAttribute(ATTR_LOADED);
  clearLoadingSpace(img);

  const fallback = EDIT_CANVAS_IMAGE_FALLBACK;
  img.setAttribute(ATTR_SRC, fallback);
  // 先改属性再赋 .src，减少短暂用坏链发请求的窗口
  img.setAttribute('src', fallback);
  img.src = fallback;
}

/**
 * 在挂入 live DOM 之前，把已知失败 URL 改成 fallback，避免浏览器自动请求。
 * 用于 fragment / morph 目标树 / innerHTML 解析结果。
 */
export function rewriteKnownFailedImages(root: ParentNode): number {
  const images = root.querySelectorAll('img');
  let rewritten = 0;

  for (let i = 0; i < images.length; i += 1) {
    const node = images[i];
    if (!(node instanceof HTMLImageElement)) {
      continue;
    }
    const src = node.getAttribute('src') || '';
    if (!src || isFallbackSrc(src)) {
      continue;
    }
    if (!isKnownFailedImageOrigin(src)) {
      continue;
    }
    applyImageFallback(node, src);
    rewritten += 1;
  }

  return rewritten;
}

function syncImageState(img: HTMLImageElement): void {
  const currentSrc = img.getAttribute('src') || '';

  if (!currentSrc) {
    applyImageFallback(img);
    return;
  }

  // 已是失败兜底：保持 error
  if (img.getAttribute(ATTR_ERROR) === '1' && isFallbackSrc(currentSrc)) {
    return;
  }

  // 已知失败 URL（含新节点）：立刻 fallback，不要先 loading 再 error
  if (!isFallbackSrc(currentSrc) && isKnownFailedImageOrigin(currentSrc)) {
    applyImageFallback(img, currentSrc);
    return;
  }

  const marked =
    img.getAttribute(ATTR_MARK) === '1' &&
    img.getAttribute(ATTR_LOADED) !== '1' &&
    img.getAttribute(ATTR_ERROR) !== '1';

  if (!img.complete) {
    reserveLoadingSpace(img);
    return;
  }

  if (img.naturalWidth > 0) {
    markLoaded(img);
    return;
  }

  if (marked) {
    reserveLoadingSpace(img);
    return;
  }

  applyImageFallback(img);
}

function onImageLoad(this: HTMLImageElement): void {
  if (this.getAttribute(ATTR_ERROR) === '1' && isFallbackSrc(this.getAttribute('src') || '')) {
    return;
  }
  markLoaded(this);
}

function onImageError(this: HTMLImageElement): void {
  applyImageFallback(this);
}

/**
 * 编辑画布图片稳定化：loading 占位 + 失败兜底，减轻高度从 0 撑开的抖动。
 * 在 commitMountPlan 之后调用（innerHTML/morph 后需重新同步状态）。
 */
export function stabilizeEditCanvasImages(root: ParentNode): void {
  // 先改写已知失败，再绑监听（防止新节点先按坏链走 loading）
  rewriteKnownFailedImages(root);

  const images = root.querySelectorAll('img');

  for (let i = 0; i < images.length; i += 1) {
    const node = images[i];
    if (!(node instanceof HTMLImageElement)) {
      continue;
    }

    const img = node;
    const currentSrc = img.getAttribute('src') || '';

    img.setAttribute(ATTR_MARK, '1');

    if (img.getAttribute(ATTR_ERROR) === '1' && isFallbackSrc(currentSrc)) {
      img.setAttribute(ATTR_SRC, currentSrc);
      if (!boundImages.has(img)) {
        boundImages.add(img);
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageError);
      }
      continue;
    }

    if (img.getAttribute(ATTR_SRC) !== currentSrc) {
      img.removeAttribute(ATTR_LOADED);
      img.removeAttribute(ATTR_ERROR);
      img.setAttribute(ATTR_SRC, currentSrc);
      rememberOrigin(img, currentSrc);
    } else if (currentSrc && !isFallbackSrc(currentSrc)) {
      rememberOrigin(img, currentSrc);
    }

    if (!boundImages.has(img)) {
      boundImages.add(img);
      img.addEventListener('load', onImageLoad);
      img.addEventListener('error', onImageError);
    }

    syncImageState(img);
  }
}

/** morph key / 同源判断：优先原始内容 URL */
export function getImageIdentitySrc(el: HTMLImageElement): string | null {
  const origin = el.getAttribute(ATTR_ORIGIN);
  if (origin) {
    return origin;
  }
  const src = el.getAttribute('src');
  if (src && !isFallbackSrc(src)) {
    return src;
  }
  return src || null;
}
