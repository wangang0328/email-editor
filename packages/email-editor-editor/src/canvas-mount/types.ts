import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import type { SegmentDirectPatch } from '@/render-cache/types';

/** postProcessEmailHtml 配置项 */
export interface PostProcessEmailHtmlOptions {
  /** 是否将合并标签渲染为可识别 Badge */
  enabledMergeTagsBadge: boolean;
}

/** postProcess 产物：挂载 HTML + 可复用的 Document（供段切片） */
export interface PostProcessResult {
  /** 写入画布容器的 innerHTML（head + body 可渲染子节点拼接） */
  mountHtml: string;
  /** 已完成标注的完整 HTML 文档，供 extractSegmentOuterHtml 等使用 */
  document: Document;
}

/**
 * 段级挂载快照（uid 体系）。
 * - segmentUidOrder：segment 文档序
 * - hashes：uid → subtreeHash
 */
export interface SegmentMountSnapshot {
  segmentUidOrder: string[];
  hashes: Record<string, string>;
  /** 整页 JSON 指纹（含 page 级 attributes），用于检测侧栏属性变更 */
  pageFingerprint?: string;
}

/** @deprecated 使用 SegmentMountSnapshot */
export type SegmentHashSnapshot = SegmentMountSnapshot;

/** 单段挂载动作 */
export type SegmentMountAction = 'skip' | 'replace';

/** 段级挂载计划 */
export interface SegmentMountPlan {
  /**
   * - full：冷启动整页 innerHTML
   * - morph-full：新增段 / 内容+结构混合变更
   * - reorder：仅 segment 顺序变（零编译；兼容旧名，等同 splice）
   * - splice：同父移段 — 目标序对齐（零编译）
   * - remove：同父删段 — 删 DOM + 剩余序对齐（零编译）
   * - segment：部分 segment hash 变
   * - noop：全部未变
   */
  mode: 'full' | 'morph-full' | 'reorder' | 'splice' | 'remove' | 'segment' | 'noop';
  mountHtml?: string;
  /** @deprecated 使用 spliceStableIds */
  reorderStableIds?: string[];
  /** splice / remove 后的目标 segment uid 序 */
  spliceStableIds?: string[];
  /** remove：从 DOM 删除的 segment uid */
  removeStableIds?: string[];
  segments?: Array<{
    idx: string;
    stableId: string;
    subtreeHash: string;
    action: SegmentMountAction;
    outerHtml?: string;
  }>;
}

/** mountEditCanvas 入参 */
export interface EditCanvasMountInput {
  container: HTMLElement;
  rawHtml: string;
  pageData: IBlockData;
  options: PostProcessEmailHtmlOptions;
  prevSegmentSnapshot: SegmentMountSnapshot | null;
  skipMount?: boolean;
  /** L2 快路径：已编译段 raw 片段，与 plan replace 对齐后段级 morph */
  segmentPatches?: SegmentDirectPatch[];
}

/** mountEditCanvas 返回值 */
export interface EditCanvasMountResult {
  mode:
    | 'dom-full'
    | 'dom-morph-full'
    | 'dom-reorder'
    | 'dom-splice'
    | 'dom-remove'
    | 'dom-segment'
    | 'dom-noop'
    | 'skipped';
  segmentSnapshot: SegmentMountSnapshot;
  totalSegments: number;
  updatedSegments: number;
  skippedSegments: number;
  postProcessMs: number;
  planMs: number;
  fragmentBuildMs: number;
  commitMs: number;
  commitBatches: number;
}
