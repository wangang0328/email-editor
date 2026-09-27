import { get, isString } from 'lodash-es';
import type { BlockType } from '../types/block-types';
import type { IBlockData } from '../types/block-data';

export function getPageIdx() {
  return 'content';
}

export function getChildIdx(idx: string, index: number) {
  return `${idx}.children.[${index}]`;
}

export function getNodeIdxClassName(idx: string) {
  return `node-idx-${idx}`;
}

export function getNodeTypeClassName(type: string) {
  return `node-type-${type}`;
}

export function getNodeIdxFromClassName(
  classList: DOMTokenList | string | readonly string[]
): string | undefined {
  return Array.from(isString(classList) ? classList.split(' ') : classList)
    .find((item) => item.startsWith('node-idx-'))
    ?.replace(/^node-idx-/, '');
}

export function getNodeTypeFromClassName(
  classList: DOMTokenList | string | readonly string[]
): BlockType | null {
  return (
    (Array.from(isString(classList) ? classList.split(' ') : classList)
      .find((item) => item.includes('node-type-'))
      ?.replace('node-type-', '') as BlockType) || null
  );
}

export const getIndexByIdx = (idx: string) => {
  return Number(/\.\[(\d+)\]$/.exec(idx)?.[1]) || 0;
};

export const getParentIdx = (idx: string) => {
  if (idx === getPageIdx()) return undefined;
  return /(.*)\.children\.\[\d+\]$/.exec(idx)?.[1];
};

export const getValueByIdx = <T extends IBlockData>(
  values: { content: IBlockData },
  idx: string
): T | null => {
  return get(values, idx) as T | null;
};

export const getParentByIdx = <T extends IBlockData = IBlockData>(
  values: { content: IBlockData },
  idx: string
): T | null => {
  return get(values, getParentIdx(idx) || '') as T | null;
};

export const getSiblingIdx = (sourceIndex: string, num: number) => {
  return sourceIndex.replace(/\[(\d+)\]$/, (_, index) => {
    if (Number(index) + num < 0) return '[0]';
    return `[${Number(index) + num}]`;
  });
};

export const getParentByType = <T extends IBlockData>(
  context: { content: IBlockData },
  idx: string,
  type: BlockType
): T | null => {
  if (!idx) return null;
  let parentIdx = getParentIdx(idx);
  while (parentIdx) {
    const parent = get(context, parentIdx) as T;
    if (parent && parent.type === type) return parent;
    parentIdx = getParentIdx(parentIdx);
  }
  return null;
};

export const getParenRelativeByType = <T extends IBlockData>(
  context: { content: IBlockData },
  idx: string,
  type: BlockType
): { parentIdx: string; insertIndex: number; parent: IBlockData } | null => {
  let prevIdx = '';
  let parentIdx: string | undefined = idx;
  while (parentIdx) {
    const parent = get(context, parentIdx) as T;
    if (parent && parent.type === type) {
      return {
        insertIndex: prevIdx
          ? getIndexByIdx(prevIdx)
          : parent.children.length - 1,
        parentIdx,
        parent,
      };
    }
    prevIdx = parentIdx;
    parentIdx = getParentIdx(parentIdx);
  }
  return null;
};
