import { L1_CACHE_MAX_ENTRIES, L2_CACHE_MAX_ENTRIES } from './constants';
import { buildPageCacheKey, buildPageFingerprint, buildSegmentCacheKey } from './hash';
import { LruStore } from './lruStore';
import type {
  DomPreserveSnapshot,
  PageCacheEntry,
  RenderCacheKeyInput,
  RenderCacheStats,
  SegmentCacheEntry,
} from './types';

declare global {
  interface Window {
    __EE_RENDER_CACHE__?: RenderCacheManager;
  }
}

/**
 * 三级渲染缓存统一管理器（单例）。
 *
 * | 层级 | 颗粒度 | 典型场景 |
 * |------|--------|----------|
 * | L1   | 整页 HTML | 冷启动重复打开、Undo 精确回退 |
 * | L2   | Section HTML 片段 | 改单个 section 属性、部分段 subtreeHash 未变 |
 * | L3   | 运行时冻结 HTML | 富文本输入中保留 DOM |
 */
export class RenderCacheManager {
  private readonly l1Store = new LruStore<PageCacheEntry>(L1_CACHE_MAX_ENTRIES);

  private readonly l2Store = new LruStore<SegmentCacheEntry>(L2_CACHE_MAX_ENTRIES);

  private l3Snapshot: DomPreserveSnapshot | null = null;

  private stats: RenderCacheStats = {
    l1: { hits: 0, misses: 0, size: 0 },
    l2: { hits: 0, misses: 0, size: 0 },
    l3: { hits: 0, preserves: 0 },
  };

  // ─── L1 整页 ─────────────────────────────────────────────

  getL1(key: string): PageCacheEntry | undefined {
    const entry = this.l1Store.get(key);
    if (entry) {
      this.stats.l1.hits += 1;
    }
    return entry;
  }

  setL1(key: string, entry: PageCacheEntry): void {
    this.l1Store.set(key, entry);
    this.stats.l1.size = this.l1Store.size;
  }

  recordL1Miss(): void {
    this.stats.l1.misses += 1;
  }

  buildL1Key(input: RenderCacheKeyInput): string {
    return buildPageCacheKey(input);
  }

  // ─── L2 段级 ─────────────────────────────────────────────

  getL2(key: string): SegmentCacheEntry | undefined {
    const entry = this.l2Store.get(key);
    if (entry) {
      this.stats.l2.hits += 1;
    }
    return entry;
  }

  setL2(key: string, entry: SegmentCacheEntry): void {
    this.l2Store.set(key, entry);
    this.stats.l2.size = this.l2Store.size;
  }

  recordL2Miss(): void {
    this.stats.l2.misses += 1;
  }

  buildL2Key(segmentStableId: string, subtreeHash: string, input: RenderCacheKeyInput): string {
    return buildSegmentCacheKey(segmentStableId, subtreeHash, input);
  }

  /** 全量编译后批量写入 L2 */
  seedL2FromFullHtml(
    segments: Array<{ idx: string; stableId: string; subtreeHash: string; cacheable: boolean }>,
    fullHtml: string,
    input: RenderCacheKeyInput,
    extractSegmentHtml: (html: string, idx: string) => string | null,
  ): void {
    const now = Date.now();
    for (const segment of segments) {
      if (!segment.cacheable) {
        continue;
      }
      const fragment = extractSegmentHtml(fullHtml, segment.idx);
      if (!fragment) {
        continue;
      }
      const key = this.buildL2Key(segment.stableId, segment.subtreeHash, input);
      this.setL2(key, {
        segmentIdx: segment.idx,
        stableId: segment.stableId,
        html: fragment,
        subtreeHash: segment.subtreeHash,
        createdAt: now,
      });
    }
  }

  // ─── L3 DOM 保留 ─────────────────────────────────────────

  /**
   * 进入 L3：冻结当前 HTML，富文本聚焦期间跳过后续管线。
   */
  preserveDom(html: string, input: RenderCacheKeyInput): void {
    this.l3Snapshot = {
      html,
      pageFingerprint: buildPageFingerprint(
        input.pageData,
        input.profile,
        input.dataSource,
        {
          breakpointOverride: input.breakpointOverride,
          keepClassName: input.keepClassName,
        },
      ),
      focusedAt: Date.now(),
    };
    this.stats.l3.preserves += 1;
    this.syncWindow();
  }

  /** 退出 L3 保留模式 */
  releaseDomPreserve(): void {
    this.l3Snapshot = null;
    this.syncWindow();
  }

  /**
   * L3 命中：有快照且 page 指纹未变时直接返回冻结 HTML。
   */
  tryL3(input: RenderCacheKeyInput): string | null {
    if (!this.l3Snapshot) {
      return null;
    }
    const fingerprint = buildPageFingerprint(
      input.pageData,
      input.profile,
      input.dataSource,
      {
        breakpointOverride: input.breakpointOverride,
        keepClassName: input.keepClassName,
      },
    );
    if (fingerprint !== this.l3Snapshot.pageFingerprint) {
      this.l3Snapshot = null;
      return null;
    }
    this.stats.l3.hits += 1;
    return this.l3Snapshot.html;
  }

  getL3Snapshot(): DomPreserveSnapshot | null {
    return this.l3Snapshot;
  }

  // ─── 工具 ────────────────────────────────────────────────

  getStats(): RenderCacheStats {
    return {
      l1: { ...this.stats.l1, size: this.l1Store.size },
      l2: { ...this.stats.l2, size: this.l2Store.size },
      l3: { ...this.stats.l3 },
    };
  }

  clear(): void {
    this.l1Store.clear();
    this.l2Store.clear();
    this.l3Snapshot = null;
    this.stats = {
      l1: { hits: 0, misses: 0, size: 0 },
      l2: { hits: 0, misses: 0, size: 0 },
      l3: { hits: 0, preserves: 0 },
    };
    this.syncWindow();
  }

  private syncWindow(): void {
    if (typeof window !== 'undefined') {
      window.__EE_RENDER_CACHE__ = this;
    }
  }
}

let globalManager: RenderCacheManager | null = null;

/** 全局单例：跨 MjmlDomRender / PreviewEmailProvider 共享 L1/L2/L3 */
export function getRenderCacheManager(): RenderCacheManager {
  if (!globalManager) {
    globalManager = new RenderCacheManager();
    if (typeof window !== 'undefined') {
      window.__EE_RENDER_CACHE__ = globalManager;
    }
  }
  return globalManager;
}
