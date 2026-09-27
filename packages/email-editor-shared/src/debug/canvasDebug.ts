/**
 * 编辑画布渲染管线排查（compile + mount + 缓存决策）
 * 控制台过滤：[EE-Canvas]
 *
 * 开启：localStorage.setItem('ee-canvas-debug', '1') 后刷新
 * 关闭：localStorage.setItem('ee-canvas-debug', '0')
 */
const DEBUG_KEY = 'ee-canvas-debug';

export function isCanvasDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(DEBUG_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
  } catch {
    /* ignore */
  }
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
}

export function canvasDebug(tag: string, payload?: Record<string, unknown>): void {
  if (!isCanvasDebugEnabled()) return;
  const time = performance.now().toFixed(1);
  if (payload) {
    console.log(`[EE-Canvas:${tag}] @${time}ms`, payload);
  } else {
    console.log(`[EE-Canvas:${tag}] @${time}ms`);
  }
}

let hintLogged = false;

export function canvasDebugHintOnce(): void {
  if (hintLogged || typeof window === 'undefined') return;
  hintLogged = true;
  if (isCanvasDebugEnabled()) {
    console.info(
      '[EE-Canvas] 画布管线调试已开启。过滤 [EE-Canvas] 查看 compile/mount 降级原因。关闭: localStorage.setItem("ee-canvas-debug","0")',
    );
    return;
  }
  console.info(
    '[EE-Canvas] 画布管线调试已关闭。开启: localStorage.setItem("ee-canvas-debug","1") 后刷新',
  );
}
