import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { BlockType } from '@wa-dev/email-editor-blocks-react';
import { getChildIdx } from '@wa-dev/email-editor-blocks-react';
import { useHoverIdx } from '@/hooks/useHoverIdx';
import { HoverIdxContext } from '@/components/Provider/HoverIdxProvider';
import { useDataTransfer } from '@/hooks/useDataTransfer';
import { isUndefined } from 'lodash-es';
import { useBlock } from '@/hooks/useBlock';
import { resolveDragPreviewSource, setBlockDragImage } from '@/utils';
import { canvasDebug } from '@wa-dev/email-editor-shared';
import { useMemoizedFn } from 'ahooks';

export type BlockAvatarWrapperProps = {
  children?: React.ReactNode;
  type: BlockType | string;
  /** 新建块时的初始数据（如布局块预置的 SECTION + COLUMN 结构） */
  payload?: any;
  /** add：从左侧面板拖入新块；move：画布内移动已有块 */
  action?: 'add' | 'move';
  hideIcon?: boolean;
  /** move 模式下被移动块在 JSON 树中的 idx 路径 */
  idx?: string;
};

/**
 * 统一拖拽封装：左侧面板块列表、快捷工具栏、画布 FocusTooltip 移动手柄都通过此组件发起拖放。
 *
 * 协作方：
 * - dragStart：写入 HoverIdxProvider.dataTransfer（块类型 / 来源 idx）
 * - dragover：useDropBlock（画布）实时更新 dataTransfer.parentIdx / positionIndex
 * - dragEnd：读取插入位置，调用 useBlock.addBlock 或 moveBlock 写回表单
 */
export const BlockAvatarWrapper: React.FC<BlockAvatarWrapperProps> = props => {
  const { type, children, payload, action = 'add', idx } = props;
  const { addBlock, moveBlock } = useBlock();
  const { setIsDragging, setHoverIdx } = useHoverIdx();
  const { setDataTransfer, dataTransfer } = useDataTransfer();
  const { dataTransferRef } = useContext(HoverIdxContext);
  const ref = useRef<HTMLDivElement>(null);
  const dragPreviewCleanupRef = useRef<(() => void) | null>(null);
  const [isLocalDragging, setIsLocalDragging] = useState(false);

  const clearDragPreview = useCallback(() => {
    dragPreviewCleanupRef.current?.();
    dragPreviewCleanupRef.current = null;
    document.body.style.removeProperty('cursor');
  }, []);

  const onDragStart = useMemoizedFn(
    (ev: React.DragEvent) => {
      // 记录拖放意图；parentIdx/positionIndex 由画布 useDropBlock 在 dragover 时同步写入
      if (action === 'add') {
        setDataTransfer({
          type: type,
          action,
          payload,
        });
      } else {
        setDataTransfer({
          type: type,
          action,
          sourceIdx: idx,
        });
      }

      // 自定义拖拽幽灵图（左侧面板用块图标，move 模式用画布上对应块 DOM）
      const previewSource = resolveDragPreviewSource(action, idx, ref.current);
      if (previewSource) {
        dragPreviewCleanupRef.current = setBlockDragImage(ev.nativeEvent, previewSource);
      }

      document.body.style.cursor = 'grabbing';
      setIsLocalDragging(true);
      setIsDragging(true);
    }
  );

  const onDragEnd = useMemoizedFn(() => {
    clearDragPreview();
    setIsLocalDragging(false);

    // 优先读 ref：dragend 触发时 React state 可能尚未提交，ref 由 HoverIdxProvider 同步维护
    const transfer = dataTransferRef.current ?? dataTransfer;
    if (!transfer) {
      setIsDragging(false);
      setHoverIdx('');
      return;
    }

    if (action === 'add' && !isUndefined(transfer.parentIdx)) {
      addBlock({
        type,
        parentIdx: transfer.parentIdx,
        positionIndex: transfer.positionIndex,
        payload,
      });
    } else if (
      idx &&
      !isUndefined(transfer.sourceIdx) &&
      !isUndefined(transfer.parentIdx) &&
      !isUndefined(transfer.positionIndex)
    ) {
      moveBlock(
        transfer.sourceIdx,
        transfer.parentIdx,
        transfer.positionIndex,
      );
    }

    setDataTransfer(null);
    canvasDebug('drag.end', {
      action,
      parentIdx: transfer.parentIdx,
      positionIndex: transfer.positionIndex,
      sourceIdx: transfer.sourceIdx,
    });
    // 延迟一帧再清 isDragging，避免 MjmlDomRender 在 dragend 同一帧重渲染打断拖放
    requestAnimationFrame(() => {
      canvasDebug('drag.unfreeze', { action });
      setIsDragging(false);
      setHoverIdx('');
    });
  });

  // dragend 走原生事件：React onDragEnd 在部分浏览器下不如原生监听可靠
  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    ele.addEventListener('dragend', onDragEnd);
    return () => {
      ele.removeEventListener('dragend', onDragEnd);
      clearDragPreview();
    };
  }, [clearDragPreview, onDragEnd]);

  return (
    <div
      className={
        isLocalDragging
          ? 'ee-block-avatar-wrapper ee-block-avatar-dragging'
          : 'ee-block-avatar-wrapper'
      }
      ref={ref}
      onMouseDown={() => {
        window.getSelection()?.removeAllRanges();
      }}
      data-type={type}
      onDragStart={onDragStart}
      draggable
    >
      {children}
    </div>
  );
};

