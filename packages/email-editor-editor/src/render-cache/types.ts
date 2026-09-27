import type { IBlockData } from '@wa-dev/email-editor-blocks-react';

/**
 * 渲染画像：编辑画布与预览使用不同 JsonToMjml mode，缓存必须隔离。
 * - edit    → testing mode（带 node-idx，可编辑）
 * - preview → production mode（只读预览）
 */
export type RenderProfile = 'edit' | 'preview';

/** 三级缓存命中来源（用于 perf 埋点与调试） */
export type RenderCacheHitLevel = 'L1' | 'L2' | 'L3' | 'miss';

/**
 * L2 缓存颗粒度：页面下可独立编译的「渲染段」。
 * 通常为 section / hero / advanced_section 等，idx 与块树路径一一对应。
 */
export interface RenderSegment {
  /** 块路径，如 content.children.[0] 或 content.children.[0].children.[2] */
  idx: string;
  /** 块稳定 ID（data-ee-uid），move 后不变 */
  stableId: string;
  block: IBlockData;
  /** 该段整棵子树的稳定 hash */
  subtreeHash: string;
  /** 子树是否含条件/迭代等依赖全局 context 的块，为 false 时不参与 L2 */
  cacheable: boolean;
}

/** L1 整页 HTML 缓存条目 */
export interface PageCacheEntry {
  html: string;
  mjmlString?: string;
  createdAt: number;
}

/** L2 Section 级 HTML 片段缓存条目 */
export interface SegmentCacheEntry {
  segmentIdx: string;
  stableId: string;
  html: string;
  subtreeHash: string;
  createdAt: number;
}

/** L2 快路径：已编译的段 raw 片段，mount 侧 postProcess 后 morph */
export interface SegmentDirectPatch {
  stableId: string;
  idx: string;
  subtreeHash: string;
  rawHtml: string;
}

/**
 * L3 运行时 DOM 保留快照。
 * 富文本聚焦时冻结当前 HTML，避免输入过程中重复跑管线。
 */
export interface DomPreserveSnapshot {
  html: string;
  /** 冻结时的 page 指纹，用于判断退出保留后是否需重算 */
  pageFingerprint: string;
  focusedAt: number;
}

/** 构建缓存 key 的输入（所有影响 HTML 输出的因素） */
export interface RenderCacheKeyInput {
  pageData: IBlockData;
  profile: RenderProfile;
  dataSource?: Record<string, unknown>;
  /** 预览专用：调整后的 breakpoint 字符串 */
  breakpointOverride?: string;
  /** production 预览是否 keepClassName */
  keepClassName?: boolean;
}

/** compilePipeline 入参 */
export interface CompilePipelineInput extends RenderCacheKeyInput {
  /**
   * L2 组装基线：上一版已成功渲染的整页 HTML。
   * 提供时 L1 miss 后尝试按段命中 L2，只重编译未缓存段。
   */
  baselineHtml?: string;
  /** 为 false 时走全量编译且不读写缓存（如 onBeforePreview 自定义变换） */
  useCache?: boolean;
  /** L3：是否处于 DOM 保留模式 */
  domPreserve?: DomPreserveSnapshot | null;
}

/** compilePipeline 出参 */
export interface CompilePipelineResult {
  html: string;
  mjmlString: string;
  hitLevel: RenderCacheHitLevel;
  /** L2 段级缓存统计 */
  segmentStats?: {
    l2Hits: number;
    recomputed: number;
    total: number;
  };
  /** L2 快路径：跳过整页组装，由 mount 段级 morph */
  segmentPatches?: SegmentDirectPatch[];
  skipFullHtmlAssembly?: boolean;
  pipelineMs: number;
}

/** 缓存统计（可通过 window.__EE_RENDER_CACHE__ 查看） */
export interface RenderCacheStats {
  l1: { hits: number; misses: number; size: number };
  l2: { hits: number; misses: number; size: number };
  l3: { hits: number; preserves: number };
}
