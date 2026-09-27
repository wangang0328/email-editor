/** 左侧面板 / Tabs / 选中态排查，控制台过滤 [EE-Panel] */
const DEBUG_KEY = 'ee-panel-debug';

export function isPanelDebugEnabled(): boolean {
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

export function panelDebug(tag: string, payload?: Record<string, unknown>): void {
  if (!isPanelDebugEnabled()) return;
  const time = performance.now().toFixed(1);
  if (payload) {
    console.log(`[EE-Panel:${tag}] @${time}ms`, payload);
  } else {
    console.log(`[EE-Panel:${tag}] @${time}ms`);
  }
}

let hintLogged = false;

export function panelDebugHintOnce(): void {
  if (hintLogged || typeof window === 'undefined') return;
  hintLogged = true;
  if (isPanelDebugEnabled()) {
    console.info(
      '[EE-Panel] 调试已开启。关闭: localStorage.setItem("ee-panel-debug","0")',
    );
    return;
  }
  console.info(
    '[EE-Panel] 调试已关闭。开启: localStorage.setItem("ee-panel-debug","1") 后刷新',
  );
}
