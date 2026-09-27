/** 左侧面板 / Tabs 布局排查日志，控制台过滤 [EE-Panel] */
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
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
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
  if (hintLogged || typeof window === 'undefined' || !isPanelDebugEnabled()) return;
  hintLogged = true;
  console.info(
    '[EE-Panel] 调试已开启。关闭: localStorage.setItem("ee-panel-debug","0")',
  );
}
