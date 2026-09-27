import { t } from '@lingui/core/macro';
import React, { useRef } from 'react';
import { IconFont, TextStyle, scrollBlockEleIntoView, useBlock, useEditorProps } from '@wa-dev/email-editor-editor';
import { ArrowDownToLine, ArrowUpToLine, Copy, Play, Trash2 } from 'lucide-react';
import { getIndexByIdx, getParentIdx, getSiblingIdx } from '@wa-dev/email-editor-blocks-react';
import styles from './index.module.scss';
import { IBlockDataWithId } from '../../../BlockLayer';
import { useAddToCollection } from '@wa-dev/email-editor-panels';

export function ContextMenu({
  moveBlock,
  copyBlock,
  removeBlock,
  contextMenuData,
  onClose,
}: {
  onClose: (ev?: React.MouseEvent) => void;
  moveBlock: ReturnType<typeof useBlock>['moveBlock'];
  copyBlock: ReturnType<typeof useBlock>['copyBlock'];
  removeBlock: ReturnType<typeof useBlock>['removeBlock'];
  contextMenuData: {
    blockData: IBlockDataWithId;
    left: number;
    top: number;
  };
}) {
  const { blockData, left, top } = contextMenuData;
  const idx = blockData.id;
  const { modal, modalVisible, setModalVisible } = useAddToCollection();
  const props = useEditorProps();
  const ref = useRef<HTMLDivElement>(null);

  const handleMoveUp = () => {
    const parentIdx = getParentIdx(idx);
    const index = getIndexByIdx(idx);
    if (!parentIdx || index <= 0) return;
    // insert-before = 前一位：与上一个兄弟交换
    moveBlock(idx, parentIdx, index - 1);
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, -1),
    });
    onClose();
  };

  const handleMoveDown = () => {
    const parentIdx = getParentIdx(idx);
    const index = getIndexByIdx(idx);
    if (!parentIdx) return;
    // insert-before = index+2：越过下一个兄弟，再按同父 remove 校正落到 index+1
    moveBlock(idx, parentIdx, index + 2);
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleCopy: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    copyBlock(idx);
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleAddToCollection = () => {
    setModalVisible(true);
  };

  const handleDelete = () => {
    removeBlock(idx);
    onClose();
  };

  const isFirst = getIndexByIdx(idx) === 0;

  return (
    <div ref={ref} style={{ visibility: modalVisible ? 'hidden' : undefined }}>
      <div
        style={{
          left: left,
          top: top,
        }}
        className={styles.wrap}
        onClick={(e) => e.stopPropagation()}
      >
        {!isFirst && (
          <div className={styles.listItem} onClick={handleMoveUp}>
            <IconFont icon={ArrowUpToLine} size={14} style={{ marginRight: 10 }} />{' '}
            <TextStyle>{t`上移`}</TextStyle>
          </div>
        )}
        <div className={styles.listItem} onClick={handleMoveDown}>
          <IconFont icon={ArrowDownToLine} size={14} style={{ marginRight: 10 }} />{' '}
          <TextStyle>{t`下移`}</TextStyle>
        </div>
        <div className={styles.listItem} onClick={handleCopy}>
          <IconFont icon={Copy} size={14} style={{ marginRight: 10 }} />{' '}
          <TextStyle>{t({ context: 'blockLayer.menu', message: '复制' })}</TextStyle>
        </div>
        {props.onAddCollection && (
            <div className={styles.listItem} onClick={handleAddToCollection}>
              <IconFont icon={Play} size={14} style={{ marginRight: 10 }} />{' '}
              <TextStyle>{t`添加到收藏`}</TextStyle>
            </div>
        )}
        <div className={styles.listItem} onClick={handleDelete}>
          <IconFont icon={Trash2} size={14} style={{ marginRight: 10 }} />{' '}
          <TextStyle>{t({ context: 'blockLayer.menu', message: '删除' })}</TextStyle>
        </div>
      </div>
      <div
        className={styles.contextmenuMark}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose(e);
        }}
      />
      {modal}
    </div>
  );
}
