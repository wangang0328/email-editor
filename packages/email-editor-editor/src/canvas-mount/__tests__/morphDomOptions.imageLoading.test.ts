import { morphElementOuterHtml } from '../morphDomOptions';
import {
  ATTR_ORIGIN,
  EDIT_CANVAS_IMAGE_FALLBACK,
  clearFailedImageOriginCache,
  markImageOriginFailed,
  rewriteKnownFailedImages,
  stabilizeEditCanvasImages,
} from '../stabilizeEditCanvasImages';

describe('morphDomOptions image loading preserve', () => {
  afterEach(() => {
    clearFailedImageOriginCache();
  });

  it('同 src morph 不清掉 loading 的 minHeight / data-ee-img', () => {
    const live = document.createElement('div');
    live.innerHTML =
      '<div data-ee-uid="sec-a" class="email-block node-type-section"><img src="https://example.com/a.png" width="400" /></div>';
    const img = live.querySelector('img') as HTMLImageElement;
    Object.defineProperty(img, 'complete', { configurable: true, get: () => false });
    Object.defineProperty(img, 'naturalWidth', { configurable: true, get: () => 0 });

    stabilizeEditCanvasImages(live);
    expect(img.getAttribute('data-ee-img')).toBe('1');
    expect(img.style.minHeight).toBe('140px');

    const nextOuter =
      '<div data-ee-uid="sec-a" class="email-block node-type-section"><img src="https://example.com/a.png" width="400" alt="x" /></div>';
    expect(morphElementOuterHtml(live.firstElementChild!, nextOuter)).toBe(true);

    const after = live.querySelector('img') as HTMLImageElement;
    expect(after).toBe(img);
    expect(after.getAttribute('data-ee-img')).toBe('1');
    expect(after.getAttribute('data-ee-img-loaded')).toBeNull();
    expect(after.style.minHeight).toBe('140px');
    expect(after.getAttribute('alt')).toBe('x');
  });

  it('失败态 morph 回原始 URL 时不重请求，保持 fallback', () => {
    const broken = 'https://example.com/broken.png';
    const live = document.createElement('div');
    live.innerHTML = `<div data-ee-uid="sec-a" class="email-block node-type-section"><img src="${broken}" width="400" /></div>`;
    const img = live.querySelector('img') as HTMLImageElement;
    Object.defineProperty(img, 'complete', { configurable: true, get: () => false });
    Object.defineProperty(img, 'naturalWidth', { configurable: true, get: () => 0 });

    stabilizeEditCanvasImages(live);
    img.dispatchEvent(new Event('error'));

    expect(img.getAttribute('data-ee-img-error')).toBe('1');
    expect(img.getAttribute(ATTR_ORIGIN)).toBe(broken);
    expect(img.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);

    const nextOuter = `<div data-ee-uid="sec-a" class="email-block node-type-section"><img src="${broken}" width="400" alt="moved" /></div>`;
    expect(morphElementOuterHtml(live.firstElementChild!, nextOuter)).toBe(true);

    const after = live.querySelector('img') as HTMLImageElement;
    expect(after).toBe(img);
    expect(after.getAttribute('data-ee-img-error')).toBe('1');
    expect(after.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);
    expect(after.getAttribute(ATTR_ORIGIN)).toBe(broken);
    expect(after.getAttribute('alt')).toBe('moved');
  });

  it('换新节点时已知失败 URL 在挂载前被改成 fallback', () => {
    const broken = 'https://example.com/broken-drag.png';
    markImageOriginFailed(broken);

    const incoming = document.createElement('div');
    incoming.innerHTML = `<img src="${broken}" width="200" />`;
    expect(rewriteKnownFailedImages(incoming)).toBe(1);

    const img = incoming.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);
    expect(img.getAttribute('data-ee-img-error')).toBe('1');
    expect(img.getAttribute(ATTR_ORIGIN)).toBe(broken);
  });
});
