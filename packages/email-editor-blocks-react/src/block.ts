import { getParentIdx } from '@wa-dev/email-editor-shared';
import { get } from 'lodash-es';
export {
  getPageIdx,
  getChildIdx,
  getNodeIdxClassName,
  getNodeTypeClassName,
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
  getIndexByIdx,
  getParentIdx,
  getValueByIdx,
  getParentByIdx,
  getSiblingIdx,
  getParentByType,
  getParenRelativeByType,
} from '@wa-dev/email-editor-shared';
import type { IBlock, IBlockData } from './typings';
import { ancestorOf } from './ancestorOf';
import { getBlockByType, getBlocks } from './blockRegistry';

export const getSameParent = (
  values: { content: IBlockData },
  idx: string,
  dragType: string,
): {
  parent: IBlockData;
  parentIdx: string;
} | null => {
  let parentIdx: string | undefined | null = idx;
  const block = getBlockByType(dragType);
  if (!block) return null;

  while (parentIdx) {
    const parent = get(values, parentIdx) as IBlockData;

    if (ancestorOf(block.type, parent.type) > 0) {
      return {
        parent,
        parentIdx,
      };
    }
    parentIdx = getParentIdx(parentIdx);
  }
  return null;
};

export const getValidChildBlocks = (type: string): IBlock[] => {
  return getBlocks().filter((item) => item.validParentType.includes(type));
};
