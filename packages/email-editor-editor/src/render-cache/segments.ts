import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { getBlockStableId, getPageIdx, getParentIdx } from '@wa-dev/email-editor-shared';
import { NON_CACHEABLE_DESCENDANT_TYPES, SEGMENT_BLOCK_TYPES } from './constants';
import { hashBlockSubtree } from './hash';
import type { RenderSegment } from './types';

/** 子树是否包含不可局部缓存的动态块 */
function hasNonCacheableDescendant(block: IBlockData): boolean {
  if (NON_CACHEABLE_DESCENDANT_TYPES.has(block.type)) {
    return true;
  }
  return block.children?.some(hasNonCacheableDescendant) ?? false;
}

/** 当前块是否为 L2 渲染段根节点 */
function isSegmentRoot(block: IBlockData): boolean {
  return SEGMENT_BLOCK_TYPES.has(block.type);
}

/**
 * 从 page 根递归收集所有渲染段。只产 segment 列表
 * - section/hero 等作为段根，不再向下拆分
 * - wrapper 等容器块向下继续遍历
 */
export function collectRenderSegments(
  pageData: IBlockData,
  rootIdx: string = getPageIdx(),
): RenderSegment[] {
  const segments: RenderSegment[] = [];

  const walk = (block: IBlockData, idx: string) => {
    if (isSegmentRoot(block)) {
      segments.push({
        idx,
        stableId: getBlockStableId(block) ?? idx,
        block,
        subtreeHash: hashBlockSubtree(block),
        cacheable: !hasNonCacheableDescendant(block),
      });
      return;
    }

    block.children?.forEach((child: IBlockData, index: number) => {
      walk(child, `${idx}.children.[${index}]`);
    });
  };

  pageData.children?.forEach((child: IBlockData, index: number) => {
    walk(child, `${rootIdx}.children.[${index}]`);
  });

  return segments;
}

/** 从 segmentIdx 向上收集祖先 idx 链（不含 page 根） */
export function getAncestorIdxChain(segmentIdx: string): string[] {
  const chain: string[] = [];
  let idx = getParentIdx(segmentIdx);
  while (idx && idx !== getPageIdx()) {
    chain.unshift(idx);
    idx = getParentIdx(idx);
  }
  return chain;
}
