import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { RENDER_ENGINE_VERSION } from './constants';
import type { RenderCacheKeyInput, RenderProfile } from './types';

/**
 * 稳定 JSON 序列化：对象 key 排序，保证相同内容产生相同字符串。
 * 避免 JSON.stringify 因 key 顺序不同导致 hash 不一致。
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

/** djb2 xor 变体，同步快速 hash，适用于浏览器主线程缓存 key */
export function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** 块子树 hash（L2 段级缓存核心指纹） */
export function hashBlockSubtree(block: IBlockData): string {
  return hashString(stableStringify(block));
}

/** dataSource / mergeTags 指纹 */
export function hashDataSource(dataSource?: Record<string, unknown>): string {
  if (!dataSource || Object.keys(dataSource).length === 0) {
    return '0';
  }
  return hashString(stableStringify(dataSource));
}

/**
 * 页面级指纹（不含引擎版本，用于 L3 判断 DOM 保留期间 content 是否变化）。
 */
export function buildPageFingerprint(
  pageData: IBlockData,
  profile: RenderProfile,
  dataSource?: Record<string, unknown>,
  extras?: { breakpointOverride?: string; keepClassName?: boolean },
): string {
  return hashString(
    stableStringify({
      page: pageData,
      profile,
      dataSource: dataSource ?? {},
      breakpointOverride: extras?.breakpointOverride,
      keepClassName: extras?.keepClassName,
    }),
  );
}

/**
 * L1 整页缓存 key：content + 渲染画像 + dataSource + 引擎版本。
 * 任一因素变化即 miss，保证 bitwise 一致。
 */
export function buildPageCacheKey(input: RenderCacheKeyInput): string {
  const { pageData, profile, dataSource, breakpointOverride, keepClassName } = input;
  return hashString(
    stableStringify({
      engine: RENDER_ENGINE_VERSION,
      profile,
      page: pageData,
      dataSource: dataSource ?? {},
      breakpointOverride,
      keepClassName,
    }),
  );
}

/**
 * L2 段级缓存 key：段 stableId + 子树 hash + 渲染画像 + dataSource + 引擎版本。
 * reorder 路径不使用 L2 片段；属性变更时 idx 未变或与 uid 独立。
 */
export function buildSegmentCacheKey(
  segmentStableId: string,
  subtreeHash: string,
  input: RenderCacheKeyInput,
): string {
  return hashString(
    stableStringify({
      engine: RENDER_ENGINE_VERSION,
      profile: input.profile,
      segmentStableId,
      subtreeHash,
      dataSource: input.dataSource ?? {},
      breakpointOverride: input.breakpointOverride,
      keepClassName: input.keepClassName,
    }),
  );
}
