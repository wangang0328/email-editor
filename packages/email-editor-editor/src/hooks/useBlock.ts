import {
  BasicType,
  IBlockData,
  getChildIdx,
  getIndexByIdx,
  getPageIdx,
  getParentByIdx,
  getParentIdx,
  getValueByIdx,
  createBlockDataByType,
  getAutoCompletePath,
  getBlockByType,
} from '@wa-dev/email-editor-blocks-react';
import { cloneDeep, debounce, get } from 'lodash-es';
import { useCallback, useContext, useMemo } from 'react';

import { useEditorContext } from './useEditorContext';
import { RecordContext } from '@/components/Provider/RecordProvider';
import { useFocusIdx } from './useFocusIdx';
import { IEmailTemplate } from '@/typings';
import { useEditorProps } from './useEditorProps';
import { scrollBlockEleIntoView, exitInlineTextEditingForStructureMutation } from '@/utils';
import { regenerateBlockStableIds } from '@/utils/regenerateBlockStableIds';
import { markStructureMutation } from '@/canvas-mount/canvasMountFlags';
import { perfTime } from '@wa-dev/email-editor-shared';
import { useMemoizedFn } from 'ahooks';
import {
  adjustInsertIndexAfterRemove,
  isNoOpSameParentMove,
} from '@/utils/moveBlockIndices';

/** 结构变更只深拷贝 content 树，避免整表 values 克隆 */
function clonePageContentValues(values: IEmailTemplate): IEmailTemplate {
  return {
    ...values,
    content: cloneDeep(values.content),
  };
}

/**
 * 块 JSON 树的 CRUD 核心 Hook。
 *
 * 所有结构变更（增删移复制）和属性写入最终都通过 react-final-form 的 `change(idx, data)` 写回 `values.content`。
 * 调用方：BlockAvatarWrapper（拖放）、BlockLayer（树操作）、AttributePanel / 画布 contenteditable（属性编辑）。
 */
export function useBlock() {
  const {
    formState: { values },
    formHelpers: { getState, change },
  } = useEditorContext();

  const { focusIdx, setFocusIdx } = useFocusIdx();

  const { autoComplete } = useEditorProps();

  /** 当前 focusIdx 对应的块 JSON；focusIdx 为 'content' 时返回 Page 根节点 */
  const focusBlock = useMemo(() => {
    if (!values?.content || !focusIdx) return null;
    const pageIdx = getPageIdx();
    if (focusIdx === pageIdx) {
      return (getValueByIdx(values, pageIdx) ?? values.content);
    }
    return getValueByIdx(values, focusIdx) ;
  }, [values, focusIdx]);

  const { redo, undo, redoable, undoable, reset } = useContext(RecordContext);

  /**
   * 在 parentIdx 的 children 中插入新块。
   * 由 BlockAvatarWrapper dragEnd（action='add'）或 BlockLayer 等调用。
   */
  const addBlock = useCallback(
    (params: {
      type: string;
      parentIdx: string;
      positionIndex?: number;
      payload?: any;
      canReplace?: boolean;
    }) => {
      let { type, parentIdx, positionIndex, payload } = params;
      let nextFocusIdx: string;
      const values = perfTime('useBlock', 'addBlock.cloneDeep', () =>
        clonePageContentValues(getState().values as IEmailTemplate),
      );
      const parent = get(values, parentIdx);
      if (!parent) {
        console.error(`Invalid ${type} block`);
        return;
      }

      let child = createBlockDataByType(type, payload);

      if (typeof positionIndex === 'undefined') {
        positionIndex = parent.children.length;
      }
      nextFocusIdx = `${parentIdx}.children.[${positionIndex}]`;
      const block = getBlockByType(type);
      if (!block) {
        console.error(`Invalid ${type} block`);
        return;
      }
      const parentBlock = getBlockByType(parent.type)!;

      // autoComplete：子块不能直接放在当前父块下时，自动包裹中间容器（如 Button → Column → Section）
      if (autoComplete) {
        const autoCompletePaths = getAutoCompletePath(
          type,
          parent.type
        );
        if (autoCompletePaths) {
          autoCompletePaths.forEach((item) => {
            child = createBlockDataByType(item, {
              children: [child],
            });
            nextFocusIdx += '.children.[0]';
          });
        }
      }

      // canReplace：替换 parentIdx 指向的节点本身（而非插入为其兄弟）
      if (params.canReplace) {
        const parentIndex = getIndexByIdx(parentIdx);
        const upParent = getParentByIdx(values, parentIdx);
        if (upParent) {
          exitInlineTextEditingForStructureMutation();
          upParent.children.splice(parentIndex, 1, child);
          markStructureMutation();
          return change(getPageIdx(), { ...values.content });
        }
      }

      const fixedBlock = getBlockByType(child.type);
      if (!fixedBlock?.validParentType.includes(parent.type)) {
        console.error(
          `${block.type} cannot be used inside ${
            parentBlock.type
          }, only inside: ${block.validParentType.join(', ')}`
        );
        return;
      }

      exitInlineTextEditingForStructureMutation();
      parent.children.splice(positionIndex, 0, child);
      markStructureMutation();
      perfTime('useBlock', 'addBlock.total', () => {
        change(getPageIdx(), { ...values.content });
        setFocusIdx(nextFocusIdx);
        scrollBlockEleIntoView({
          idx: nextFocusIdx,
        });
      });
    },
    [autoComplete, change, getState, setFocusIdx]
  );

  /**
   * 将 sourceIdx 处的块移动到 destination 位置。
   * - 画布拖放：moveBlock(sourceIdx, parentIdx, insertIndex)
   *   insertIndex 为变更前 children 的 insert-before 下标（可等于 length）
   * - 工具栏/图层树：moveBlock(sourceIdx, siblingDestinationIdx)
   *   目标为「插到该兄弟当前位置之前」；若要下移一位请传 insertIndex = index+2，
   *   或使用三参数 API（见 ContextMenu）
   */
  const moveBlock = useMemoizedFn(
    (
      sourceIdx: string,
      destination: string,
      insertAt?: number,
    ) => {
      let destinationParentIdx: string;
      let insertIndex: number;

      if (insertAt !== undefined) {
        destinationParentIdx = destination;
        insertIndex = insertAt;
      } else {
        const parentIdx = getParentIdx(destination);
        if (!parentIdx) return null;
        destinationParentIdx = parentIdx;
        insertIndex = getIndexByIdx(destination);
      }

      if (sourceIdx === getChildIdx(destinationParentIdx, insertIndex)) {
        return null;
      }

      let nextFocusIdx: string;

      const values = perfTime('useBlock', 'moveBlock.cloneDeep', () =>
        clonePageContentValues(getState().values as IEmailTemplate),
      );
      const source = getValueByIdx(values, sourceIdx)!;
      const sourceParentIdx = getParentIdx(sourceIdx);
      if (!sourceParentIdx) return;
      const sourceParent = getValueByIdx(values, sourceParentIdx)!;
      const destinationParent = getValueByIdx(values, destinationParentIdx)!;

      const sourceIndex = getIndexByIdx(sourceIdx);
      const sameParent = sourceParent === destinationParent;

      if (sameParent && isNoOpSameParentMove(sourceIndex, insertIndex)) {
        return null;
      }

      if (sameParent) {
        insertIndex = adjustInsertIndexAfterRemove(sourceIndex, insertIndex);
      }

      let wrappedByAutoComplete = false;
      if (autoComplete) {
        const autoCompletePaths = getAutoCompletePath(
          source.type,
          destinationParent.type,
        );
        if (autoCompletePaths === null) {
          console.error(
            `Cannot move ${source.type} into ${destinationParent.type}`,
          );
          return;
        }
        if (autoCompletePaths.length > 0) {
          wrappedByAutoComplete = true;
        }
      }

      const [removed] = sourceParent.children.splice(sourceIndex, 1);
      let blockToInsert: IBlockData = removed;

      if (autoComplete) {
        const autoCompletePaths = getAutoCompletePath(
          source.type,
          destinationParent.type,
        )!;
        autoCompletePaths.forEach((item) => {
          blockToInsert = createBlockDataByType(item, {
            children: [blockToInsert],
          });
        });
      }

      const blockDef = getBlockByType(blockToInsert.type);
      if (!blockDef?.validParentType.includes(destinationParent.type)) {
        sourceParent.children.splice(sourceIndex, 0, removed);
        console.error(
          `${blockToInsert.type} cannot be moved into ${destinationParent.type}`,
        );
        return;
      }

      // 跨父移动后 destinationParent.children 可能已因路径仍有效，但同父时 source 已删除，
      // insertIndex 已按 remove 后坐标换算，直接插入即可。
      const maxInsert = destinationParent.children.length;
      const safeInsertIndex = Math.max(0, Math.min(insertIndex, maxInsert));
      destinationParent.children.splice(safeInsertIndex, 0, blockToInsert);

      const actualIndex = destinationParent.children.findIndex(
        (item: IBlockData) => item === blockToInsert,
      );
      nextFocusIdx = getChildIdx(
        destinationParentIdx,
        actualIndex >= 0 ? actualIndex : safeInsertIndex,
      );

      exitInlineTextEditingForStructureMutation();
      // 同父纯顺序变更：不 mark，走 splice + reannotate 零编译
      // 跨父 / autoComplete 包层：uid 集合或树形变化，仍强制 morph-full
      const sameParentOrderOnly =
        sameParent && !wrappedByAutoComplete && blockToInsert === removed;
      if (!sameParentOrderOnly) {
        markStructureMutation();
      }

      perfTime('useBlock', 'moveBlock.total', () => {
        // 整页 content 写回，确保跨父节点移动时两处 children 变更一并提交
        change(getPageIdx(), { ...values.content });

        // 必须用 splice 后算出的新路径；uidToIdx 此时尚未随 form 重建，会指向旧 idx
        setFocusIdx(nextFocusIdx);
        scrollBlockEleIntoView({
          idx: nextFocusIdx,
        });
      });
    }
  );

  /** 复制 idx 处的块，插入到其紧邻的下一个兄弟位置 */
  const copyBlock = useMemoizedFn(
    (idx: string) => {
      if (!idx) return;
      markStructureMutation();
      exitInlineTextEditingForStructureMutation();

      let nextFocusIdx: string;
      const values = perfTime('useBlock', 'copyBlock.cloneDeep', () =>
        clonePageContentValues(getState().values as IEmailTemplate),
      );

      const parentIdx = getParentIdx(idx);
      if (!parentIdx) return;
      const parent = get(values, getParentIdx(idx) || '') ;
      if (!parent) {
        console.error('Invalid block');
        return;
      }
      const duplicated = cloneDeep(get(values, idx));
      regenerateBlockStableIds(duplicated);
      const index = getIndexByIdx(idx) + 1;

      perfTime('useBlock', 'copyBlock.total', () => {
        parent.children.splice(index, 0, duplicated);
        change(getPageIdx(), { ...values.content });
        nextFocusIdx = `${parentIdx}.children.[${index}]`;
        setFocusIdx(nextFocusIdx);
        scrollBlockEleIntoView({ idx: nextFocusIdx });
      });
    }
  );

  /** 删除 idx 处的块；删除后 focus 回退到父节点 */
  const removeBlock = useMemoizedFn(
    (idx: string) => {
      if (!idx) return;
      exitInlineTextEditingForStructureMutation();

      let nextFocusIdx: string;
      const values = perfTime('useBlock', 'removeBlock.cloneDeep', () =>
        clonePageContentValues(getState().values as IEmailTemplate),
      );

      const block = getValueByIdx(values, idx);
      if (!block) {
        console.error('Invalid block');
        return;
      }
      const parentIdx = getParentIdx(idx);
      const parent = get(values, getParentIdx(idx) || '') ;
      const blockIndex = getIndexByIdx(idx);
      if (!parentIdx || !parent) {
        if (block.type === BasicType.PAGE) {
          console.error('Page node can not remove');
          return;
        }
        console.error('Invalid block');
        return;
      }
      nextFocusIdx = parentIdx;

      // 不 markStructureMutation：
      // - 删 segment → MountPlan remove（零编译）
      // - 删段内块 → 段 hash 变 → segment 编译
      // 新增段仍由 add/copy 侧 mark。
      perfTime('useBlock', 'removeBlock.total', () => {
        parent.children.splice(blockIndex, 1);
        change(getPageIdx(), { ...values.content });
        setFocusIdx(nextFocusIdx);
      });
    }
  );

  /** 按 idx 整体替换块 JSON；debounce 300ms，用于非 focus 目标的批量写入 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setValueByIdx = useMemoizedFn(
    debounce(<T extends IBlockData>(idx: string, newVal: T) => {
      change(idx, {
        ...newVal,
      });
    })
  );

  const isExistBlock = useMemoizedFn(
    (idx: string) => {
      return Boolean(get(values, idx));
    }
  );

  /** 替换当前 focusIdx 处的整块 JSON；debounce 300ms，属性面板 / 画布 contenteditable 的主要写入入口 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setFocusBlock = useMemoizedFn(
    debounce((val) => {
      change(focusIdx, { ...val });
    })
  );

  /** 仅更新当前 focusBlock.data.value；debounce 300ms，用于只改块内容值的场景 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setFocusBlockValue = useMemoizedFn(
    debounce((val) => {
      if (!focusBlock) return;
      focusBlock.data.value = val;
      change(focusIdx, { ...focusBlock });
    })
  );

  return {
    values,
    change,
    focusBlock,
    setFocusBlock,
    setFocusBlockValue,
    setValueByIdx,
    addBlock,
    moveBlock,
    copyBlock,
    removeBlock,
    isExistBlock,
    redo,
    undo,
    reset,
    redoable,
    undoable,
  };
}
