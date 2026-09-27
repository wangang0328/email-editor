import { get } from 'lodash-es';
import {
  getChildIdx,
  getIndexByIdx,
  getParentIdx,
  getSameParent,
  IPage,
  IBlockData,
  getParentByIdx,
  getBlockByType,
  BasicType,
  AdvancedType,
} from '@wa-dev/email-editor-blocks-react';
import { DirectionPosition } from './getDirectionPosition';

interface Params {
  context: { content: IPage };
  idx: string;
  directionPosition: DirectionPosition;
  dragType: string;
  /** move：画布内移动已有块 */
  action?: 'add' | 'move';
  /** move 时正在移动的块 idx，用于锁定插入容器层级 */
  sourceIdx?: string;
}

const verticalBlocks: string[] = [
  BasicType.SECTION,
  BasicType.GROUP,
  AdvancedType.SECTION,
  AdvancedType.GROUP,
];

const isColumnBlock = (type: string) =>
  ([BasicType.COLUMN, AdvancedType.COLUMN] as string[]).includes(type);

const isPageContainer = (type: string) =>
  type === BasicType.PAGE;

const isWrapperContainer = (type: string) =>
  ([BasicType.WRAPPER, AdvancedType.WRAPPER] as string[]).includes(type);

/** 按「被拖动的块」类型决定允许落入哪一层容器 */
function resolveMoveContainerType(
  sourceBlock: IBlockData,
  sourceParent: IBlockData,
): string {
  if (isWrapperContainer(sourceBlock.type)) {
    return BasicType.PAGE;
  }
  if (verticalBlocks.includes(sourceBlock.type)) {
    return sourceParent.type;
  }
  if (isColumnBlock(sourceBlock.type)) {
    return sourceParent.type;
  }
  return BasicType.COLUMN;
}

function isValidMoveTarget(
  sourceBlock: IBlockData,
  targetParent: IBlockData,
): boolean {
  const blockDef = getBlockByType(sourceBlock.type);
  if (!blockDef) return false;
  return blockDef.validParentType.includes(targetParent.type);
}

function isUnderTree(idx: string, ancestorIdx: string): boolean {
  return idx === ancestorIdx || idx.startsWith(`${ancestorIdx}.`);
}

/**
 * 从 hover 位置向上找与源块父级同类型的容器（column / wrapper / page 等）。
 * 悬停在 section 上时，对 column 类型会落入 section 内某一列。
 */
function findContainerFromHover(
  context: { content: IPage },
  hoverIdx: string,
  containerType: string,
): string | null {
  let cursor: string | undefined = hoverIdx;
  while (cursor) {
    const node = get(context, cursor) as IBlockData | undefined;
    if (node?.type === containerType) {
      return cursor;
    }
    cursor = getParentIdx(cursor) ?? undefined;
  }

  if (isColumnBlock(containerType)) {
    let sectionCursor: string | undefined = hoverIdx;
    while (sectionCursor) {
      const node = get(context, sectionCursor) as IBlockData | undefined;
      if (node && verticalBlocks.includes(node.type)) {
        return findColumnParentForMove(context, sectionCursor, hoverIdx);
      }
      sectionCursor = getParentIdx(sectionCursor) ?? undefined;
    }
  }

  return null;
}

/** 在目标容器内，解析用于计算插入位置的参照节点 */
function resolveRefIdx(
  hoverIdx: string,
  targetParentIdx: string,
): string {
  if (hoverIdx === targetParentIdx) {
    return targetParentIdx;
  }

  if (isUnderTree(hoverIdx, targetParentIdx)) {
    let refIdx = hoverIdx;
    while (true) {
      const parentIdx = getParentIdx(refIdx);
      if (!parentIdx || parentIdx === targetParentIdx) {
        break;
      }
      refIdx = parentIdx;
    }
    return refIdx;
  }

  return targetParentIdx;
}

function findColumnParentForMove(
  context: { content: IPage },
  sectionIdx: string,
  hoverIdx: string,
): string | null {
  if (hoverIdx.startsWith(`${sectionIdx}.`)) {
    let current: string | undefined = hoverIdx;
    while (current && current !== sectionIdx) {
      const node = get(context, current) as IBlockData | undefined;
      if (node && isColumnBlock(node.type)) {
        return current;
      }
      current = getParentIdx(current) ?? undefined;
    }
  }

  const section = get(context, sectionIdx) as IBlockData | undefined;
  if (!section?.children?.length) {
    return null;
  }

  for (let i = 0; i < section.children.length; i += 1) {
    if (isColumnBlock(section.children[i].type)) {
      return getChildIdx(sectionIdx, i);
    }
  }

  return null;
}

/**
 * move：插入容器必须与源块当前父级同类型（column 对 column、wrapper 对 wrapper、page 对 page），
 * 避免 wrapper / 富文本拖放被误判到 page / section 级而产生「复制」或聚焦跑偏。
 */
function getMoveInsertPosition(params: Params) {
  const { context, idx, directionPosition, sourceIdx } = params;
  if (!sourceIdx) return null;

  const sourceBlock = get(context, sourceIdx) as IBlockData | undefined;
  const sourceParentIdx = getParentIdx(sourceIdx);
  if (!sourceBlock || !sourceParentIdx) return null;

  const sourceParent = get(context, sourceParentIdx) as IBlockData;
  const containerType = resolveMoveContainerType(sourceBlock, sourceParent);

  const targetParentIdx = findContainerFromHover(context, idx, containerType);
  if (!targetParentIdx) return null;

  const targetParent = get(context, targetParentIdx) as IBlockData;
  if (!isValidMoveTarget(sourceBlock, targetParent)) {
    return null;
  }

  // 内容块不得落入 page / section / wrapper
  if (
    containerType === BasicType.COLUMN &&
    (isPageContainer(targetParent.type) ||
      isWrapperContainer(targetParent.type) ||
      verticalBlocks.includes(targetParent.type))
  ) {
    return null;
  }

  let refIdx = resolveRefIdx(idx, targetParentIdx);
  if (idx === sourceIdx) {
    refIdx = sourceIdx;
  }

  const parent = targetParent;
  const { direction, valid } = getMoveDirection(containerType, directionPosition);
  if (!valid) return null;

  let insertIndex = 0;
  let hoverIdx = refIdx;
  let endDirection = direction;

  if (refIdx === targetParentIdx) {
    if (parent.children.length === 0) {
      endDirection = '';
      insertIndex = 0;
    } else if (direction === 'top' || direction === 'left') {
      insertIndex = 0;
      hoverIdx = getChildIdx(targetParentIdx, 0);
      endDirection = direction === 'left' ? 'left' : 'top';
    } else {
      insertIndex = parent.children.length;
      hoverIdx = getChildIdx(targetParentIdx, insertIndex - 1);
      endDirection = direction === 'right' ? 'right' : 'bottom';
    }
  } else {
    const siblingIndex = getIndexByIdx(refIdx);
    hoverIdx = getChildIdx(targetParentIdx, siblingIndex);

    if (refIdx === sourceIdx) {
      insertIndex =
        /(right)|(bottom)/.test(direction)
          ? siblingIndex + 1
          : siblingIndex;
    } else {
      insertIndex =
        parent.children.length > 0 && /(right)|(bottom)/.test(direction)
          ? siblingIndex + 1
          : siblingIndex;
    }
  }

  // 同父同位：无效放置
  if (
    targetParentIdx === sourceParentIdx &&
    insertIndex === getIndexByIdx(sourceIdx)
  ) {
    return null;
  }

  return {
    parentIdx: targetParentIdx,
    insertIndex,
    endDirection,
    hoverIdx,
  };
}

function getMoveDirection(
  containerType: string,
  directionPosition: DirectionPosition,
): { valid: boolean; direction: string; isEdge: boolean } {
  if (verticalBlocks.includes(containerType)) {
    return getValidDirection(containerType, directionPosition);
  }

  return {
    direction: directionPosition.vertical.direction,
    valid: Boolean(directionPosition.vertical.direction),
    isEdge: directionPosition.vertical.isEdge,
  };
}

export function getInsertPosition(params: Params) {
  const { action = 'add' } = params;

  if (action === 'move') {
    return getMoveInsertPosition(params);
  }

  const { idx, dragType, directionPosition, context } = params;

  let parentData = getSameParent(context, idx, dragType);

  if (!parentData) return null;

  const directlyParent = getParentByIdx(context, idx);

  if (directlyParent) {
    if (directionPosition.vertical.isEdge) {
      const isTop =
        directionPosition.vertical.direction === 'top' &&
        getIndexByIdx(idx) === 0;
      const isBottom =
        directionPosition.vertical.direction === 'bottom' &&
        getIndexByIdx(idx) === directlyParent.children.length - 1;
      if (isTop || isBottom) {
        const prevParent = getParentByIdx(context, parentData.parentIdx);
        if (prevParent) {
          parentData = {
            parent: prevParent,
            parentIdx: getParentIdx(parentData.parentIdx)!,
          };
          if (isColumnBlock(parentData.parent.type)) {
            const sectionBlock = getParentByIdx(context, parentData.parentIdx);
            if (sectionBlock) {
              parentData = {
                parent: sectionBlock,
                parentIdx: getParentIdx(parentData.parentIdx)!,
              };
            }
          }
        }
      }
    } else if (directionPosition.horizontal.isEdge) {
      if (isColumnBlock(parentData.parent.type)) {
        const prevParent = getParentByIdx(context, parentData.parentIdx);
        if (prevParent) {
          const isLeft = directionPosition.horizontal.direction === 'left';
          return {
            parentIdx: getParentIdx(parentData.parentIdx)!,
            insertIndex: isLeft
              ? getIndexByIdx(parentData.parentIdx)
              : getIndexByIdx(parentData.parentIdx) + 1,
            endDirection: directionPosition.horizontal.direction,
            hoverIdx: parentData.parentIdx,
          };
        }
      }
    }
  }

  return getInsetParentAndIndex(
    context,
    idx,
    parentData.parent.type,
    directionPosition,
    'add',
  );
}

function getInsetParentAndIndex(
  context: { content: IPage },
  idx: string,
  type: string,
  directionPosition: DirectionPosition,
  action: 'add' | 'move',
): {
  parentIdx: string;
  insertIndex: number;
  endDirection: string;
  hoverIdx: string;
} | null {
  let hoverIdx = idx;
  let prevIdx = '';
  let parentIdx: string | undefined = idx;
  while (parentIdx) {
    const parent = get(context, parentIdx) as IBlockData;
    if (parent && parent.type === type) {
      const { direction, valid } = getValidDirection(
        parent.type,
        directionPosition,
      );

      if (!valid) return null;

      const isVertical = verticalBlocks.includes(parent.type);

      if (isVertical && parent.children.length > 0 && action === 'move') {
        const columnIdx = findColumnParentForMove(context, parentIdx, idx);
        if (columnIdx) {
          const column = get(context, columnIdx) as IBlockData;
          return getInsetParentAndIndex(
            context,
            idx,
            column.type,
            directionPosition,
            action,
          );
        }
      }

      if (isVertical && parent.children.length > 0 && action === 'add') {
        const isTop = directionPosition.vertical.direction === 'top';
        return {
          insertIndex: isTop
            ? getIndexByIdx(parentIdx)
            : getIndexByIdx(parentIdx) + 1,
          parentIdx: getParentIdx(parentIdx)!,
          endDirection: directionPosition.vertical.direction,
          hoverIdx: parentIdx,
        };
      }

      let insertIndex = 0;
      let endDirection = direction;

      if (prevIdx) {
        const siblingIndex = getIndexByIdx(prevIdx);
        hoverIdx = getChildIdx(parentIdx, siblingIndex);

        if (
          parent.children.length > 0 &&
          /(right)|(bottom)/.test(endDirection)
        ) {
          insertIndex = siblingIndex + 1;
        } else {
          insertIndex = siblingIndex;
        }
      } else {
        if (parent.children.length === 0) {
          endDirection = '';
        }

        if (isVertical) {
          if (direction === 'left') {
            insertIndex = 0;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, 0);
              endDirection = 'left';
            }
          } else {
            insertIndex = parent.children.length;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, insertIndex - 1);
              endDirection = 'right';
            }
          }
        } else {
          if (direction === 'top') {
            insertIndex = 0;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, 0);
              endDirection = 'top';
            }
          } else {
            insertIndex = parent.children.length;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, insertIndex - 1);
              endDirection = 'bottom';
            }
          }
        }
      }

      return {
        insertIndex,
        parentIdx,
        endDirection,
        hoverIdx,
      };
    } else {
      prevIdx = parentIdx;
      parentIdx = getParentIdx(parentIdx);
    }
  }
  return null;
}

function getValidDirection(
  targetType: string,
  directionPosition: DirectionPosition,
): { valid: boolean; direction: string; isEdge: boolean } {
  const isVertical = verticalBlocks.includes(targetType);

  let direction = directionPosition.vertical.direction;
  let isEdge = directionPosition.vertical.isEdge;

  if (isVertical) {
    direction = directionPosition.horizontal.direction;
    isEdge = directionPosition.horizontal.isEdge;
  }

  return {
    valid: isVertical
      ? Boolean(directionPosition.horizontal.direction)
      : Boolean(directionPosition.vertical.direction),
    direction,
    isEdge,
  };
}
