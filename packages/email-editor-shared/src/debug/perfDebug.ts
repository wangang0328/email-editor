/** 性能埋点排查，控制台过滤 [EE-Perf] */
const DEBUG_KEY = 'ee-perf-debug';

export type PerfMetrics = Record<string, number | string | boolean | undefined | null>;

export interface PerfEntry {
  tag: string;
  time: number;
  metrics: PerfMetrics;
}

let sessionStart = 0;
let initialRenderReported = false;
const entries: PerfEntry[] = [];
const counters: Record<string, number> = {};

function roundMs(n: number): number {
  return Math.round(n * 10) / 10;
}

function syncWindow(): void {
  if (typeof window === 'undefined') return;
  window.__EE_PERF__ = {
    entries: [...entries],
    counters: { ...counters },
    sessionStart,
    dump: () => {
      console.table(
        entries.map(e => ({
          tag: e.tag,
          ...e.metrics,
          at: roundMs(e.time),
        })),
      );
      console.log('[EE-Perf] counters', counters);
    },
    reset: () => {
      perfResetSession();
    },
  };
}

export function isPerfDebugEnabled(): boolean {
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

export function perfResetSession(): void {
  sessionStart = performance.now();
  initialRenderReported = false;
  entries.length = 0;
  Object.keys(counters).forEach(key => {
    delete counters[key];
  });
  syncWindow();
}

export function perfRecord(
  tag: string,
  step: string,
  durationMs: number,
  meta?: PerfMetrics,
): void {
  if (!isPerfDebugEnabled()) return;
  const metrics: PerfMetrics = {
    step,
    durationMs: roundMs(durationMs),
    ...meta,
  };
  entries.push({ tag, time: performance.now(), metrics });
  console.log(`[EE-Perf:${tag}] ${step}=${roundMs(durationMs)}ms`, meta ?? '');
  syncWindow();
}

export function perfTime<T>(
  tag: string,
  step: string,
  fn: () => T,
  meta?: PerfMetrics,
): T {
  if (!isPerfDebugEnabled()) return fn();
  const start = performance.now();
  try {
    return fn();
  } finally {
    perfRecord(tag, step, performance.now() - start, meta);
  }
}

export function perfReport(tag: string, metrics: PerfMetrics): void {
  if (!isPerfDebugEnabled()) return;
  const normalized: PerfMetrics = {};
  Object.entries(metrics).forEach(([key, value]) => {
    normalized[key] = typeof value === 'number' ? roundMs(value) : value;
  });
  entries.push({ tag, time: performance.now(), metrics: normalized });
  console.log(`[EE-Perf:${tag}]`, normalized);
  syncWindow();
}

export function perfCounter(name: string, meta?: PerfMetrics): void {
  if (!isPerfDebugEnabled()) return;
  counters[name] = (counters[name] ?? 0) + 1;
  if (meta) {
    console.log(`[EE-Perf:counter] ${name}=${counters[name]}`, meta);
  }
  syncWindow();
}

export function perfReportInitialRender(
  pipelineMs: number,
  parts: PerfMetrics,
): void {
  if (!isPerfDebugEnabled() || initialRenderReported) return;
  initialRenderReported = true;
  const totalMs = sessionStart ? performance.now() - sessionStart : pipelineMs;
  perfReport('editor.initialRender', {
    totalMs,
    pipelineMs: roundMs(pipelineMs),
    ...parts,
  });
}

let hintLogged = false;

export function perfDebugHintOnce(): void {
  if (hintLogged || typeof window === 'undefined') return;
  hintLogged = true;
  if (isPerfDebugEnabled()) {
    console.info(
      '[EE-Perf] 性能埋点已开启。查看汇总: window.__EE_PERF__.dump()  关闭: localStorage.setItem("ee-perf-debug","0")',
    );
    return;
  }
  console.info(
    '[EE-Perf] 性能埋点已关闭。开启: localStorage.setItem("ee-perf-debug","1") 后刷新',
  );
}

declare global {
  interface Window {
    __EE_PERF__?: {
      entries: PerfEntry[];
      counters: Record<string, number>;
      sessionStart: number;
      dump: () => void;
      reset: () => void;
    };
  }
}
