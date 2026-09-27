import {
  AdvancedType,
  BasicType,
  getParentByIdx,
  getParentIdx,
  type IBlockData,
} from '@wa-dev/email-editor-blocks-react';

const WRAPPER_TYPES: string[] = [BasicType.WRAPPER, AdvancedType.WRAPPER];

function isWrapperType(type: string | undefined): boolean {
  return Boolean(type && WRAPPER_TYPES.includes(type));
}

export type MoveSource = {
  idx: string;
  type: string;
};

/**
 * 画布移动手柄的拖拽源：若直接父级是 wrapper，提升为拖整个 wrapper，
 * 避免只拖子块时留下空壳 wrapper。
 */
export function resolveMoveSource(
  values: { content: IBlockData },
  focusIdx: string,
  focusType: string,
): MoveSource {
  if (isWrapperType(focusType)) {
    return { idx: focusIdx, type: focusType };
  }

  const parentIdx = getParentIdx(focusIdx);
  if (!parentIdx) {
    return { idx: focusIdx, type: focusType };
  }

  const parent = getParentByIdx(values, focusIdx);
  if (!parent || !isWrapperType(parent.type)) {
    return { idx: focusIdx, type: focusType };
  }

  return { idx: parentIdx, type: parent.type };
}
