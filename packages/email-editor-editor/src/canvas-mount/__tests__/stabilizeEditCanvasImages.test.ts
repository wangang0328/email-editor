import {
  EDIT_CANVAS_IMAGE_FALLBACK,
  clearFailedImageOriginCache,
  stabilizeEditCanvasImages,
} from '../stabilizeEditCanvasImages';

function createPendingImage(src: string, width?: string): HTMLImageElement {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  if (width) {
    img.setAttribute('width', width);
  }

  Object.defineProperty(img, 'complete', {
    configurable: true,
    get: () => false,
  });
  Object.defineProperty(img, 'naturalWidth', {
    configurable: true,
    get: () => 0,
  });

  return img;
}

describe('stabilizeEditCanvasImages', () => {
  afterEach(() => {
    clearFailedImageOriginCache();
  });

  it('未加载完成时写入 loading 标记并预留高度', () => {
    const root = document.createElement('div');
    const img = createPendingImage('https://example.com/a.png', '400px');
    root.appendChild(img);

    stabilizeEditCanvasImages(root);

    expect(img.getAttribute('data-ee-img')).toBe('1');
    expect(img.getAttribute('data-ee-img-loaded')).toBeNull();
    expect(img.style.minHeight).toBe('140px');
  });

  it('已缓存成功加载的图片直接标记 loaded', () => {
    const root = document.createElement('div');
    const img = document.createElement('img');
    img.setAttribute('src', 'https://example.com/ok.png');
    Object.defineProperty(img, 'complete', { get: () => true });
    Object.defineProperty(img, 'naturalWidth', { get: () => 320 });
    root.appendChild(img);

    stabilizeEditCanvasImages(root);

    expect(img.getAttribute('data-ee-img-loaded')).toBe('1');
    expect(img.style.minHeight).toBe('');
  });

  it('加载失败时切换到兜底图', () => {
    const root = document.createElement('div');
    const img = createPendingImage('https://example.com/broken.png');
    root.appendChild(img);

    stabilizeEditCanvasImages(root);
    img.dispatchEvent(new Event('error'));

    expect(img.getAttribute('data-ee-img-error')).toBe('1');
    expect(img.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);
  });

  it('src 变更时重置 loaded 状态', () => {
    const root = document.createElement('div');
    const img = document.createElement('img');
    img.setAttribute('src', 'https://example.com/old.png');
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      get: () => 100,
    });
    root.appendChild(img);

    stabilizeEditCanvasImages(root);
    expect(img.getAttribute('data-ee-img-loaded')).toBe('1');

    img.setAttribute('src', 'https://example.com/new.png');
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      get: () => 0,
    });

    stabilizeEditCanvasImages(root);

    expect(img.getAttribute('data-ee-img-loaded')).toBeNull();
    expect(img.getAttribute('data-ee-img-src')).toBe('https://example.com/new.png');
  });

  it('complete 但无尺寸且已是 loading UI 时继续占位', () => {
    const root = document.createElement('div');
    const img = createPendingImage('https://example.com/a.png', '400px');
    root.appendChild(img);
    stabilizeEditCanvasImages(root);

    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      get: () => 0,
    });

    stabilizeEditCanvasImages(root);

    expect(img.getAttribute('data-ee-img-loaded')).toBeNull();
    expect(img.getAttribute('data-ee-img-error')).toBeNull();
    expect(img.style.minHeight).toBe('140px');
  });

  it('加载失败后记住 origin，再次 stabilize 不重请求', () => {
    const root = document.createElement('div');
    const broken = 'https://example.com/broken.png';
    const img = createPendingImage(broken);
    root.appendChild(img);

    stabilizeEditCanvasImages(root);
    img.dispatchEvent(new Event('error'));

    expect(img.getAttribute('data-ee-img-error')).toBe('1');
    expect(img.getAttribute('data-ee-img-origin')).toBe(broken);
    expect(img.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);

    stabilizeEditCanvasImages(root);

    expect(img.getAttribute('data-ee-img-error')).toBe('1');
    expect(img.getAttribute('src')).toBe(EDIT_CANVAS_IMAGE_FALLBACK);
  });

  it('重复调用不会重复绑定监听', () => {
    const root = document.createElement('div');
    const img = createPendingImage('https://example.com/a.png');
    const spy = jest.spyOn(img, 'addEventListener');
    root.appendChild(img);

    stabilizeEditCanvasImages(root);
    img.removeAttribute('data-ee-img');
    stabilizeEditCanvasImages(root);

    const loadCalls = spy.mock.calls.filter((call) => call[0] === 'load');
    const errorCalls = spy.mock.calls.filter((call) => call[0] === 'error');
    expect(loadCalls).toHaveLength(1);
    expect(errorCalls).toHaveLength(1);
    expect(img.getAttribute('data-ee-img')).toBe('1');
  });
});
