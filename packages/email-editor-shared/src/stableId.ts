import { get, set } from 'lodash-es';
import type { IBlockData } from './types/block-data';
import { getChildIdx, getPageIdx } from './tree';

/** 块 JSON 内存储稳定 ID 的路径（data.value，不进入 MJML 输出） */
export const EE_UID_DATA_PATH = 'data.value.eeUid';

/** 编辑画布 DOM 上的稳定 ID 属性 */
export const EE_UID_ATTR = 'data-ee-uid';

export function createBlockStableId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ee-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getBlockStableId(block: IBlockData): string | undefined {
  const uid = get(block, EE_UID_DATA_PATH);
  return typeof uid === 'string' && uid.length > 0 ? uid : undefined;
}

/** 为单个块分配 eeUid（若缺失） */
export function ensureBlockStableId(block: IBlockData): string {
  const existing = getBlockStableId(block);
  if (existing) {
    return existing;
  }

  const uid = createBlockStableId();
  set(block, EE_UID_DATA_PATH, uid);
  return uid;
}

/** 递归为 page 子树中所有块分配 eeUid */
export function ensurePageBlockStableIds(pageData: IBlockData): void {
  const walk = (block: IBlockData) => {
    ensureBlockStableId(block);
    block.children?.forEach(walk);
  };

  walk(pageData);
}

export function pageDataNeedsStableIds(pageData: IBlockData): boolean {
  let missing = false;

  const walk = (block: IBlockData) => {
    if (!getBlockStableId(block)) {
      missing = true;
      return;
    }
    block.children?.forEach(walk);
  };

  walk(pageData);
  return missing;
}

/** idx 路径 → eeUid，供 postProcess 注入 DOM */
export function buildIdxToStableIdMap(
  pageData: IBlockData,
  rootIdx: string = getPageIdx(),
): Map<string, string> {
  const map = new Map<string, string>();

  const walk = (block: IBlockData, idx: string) => {
    const uid = getBlockStableId(block);
    if (uid) {
      map.set(idx, uid);
    }
    block.children?.forEach((child, index) => {
      walk(child, getChildIdx(idx, index));
    });
  };

  pageData.children?.forEach((child, index) => {
    walk(child, getChildIdx(rootIdx, index));
  });

  return map;
}
