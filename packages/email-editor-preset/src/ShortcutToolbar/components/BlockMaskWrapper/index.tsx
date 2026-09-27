import { IconFont, BlockAvatarWrapper } from '@wa-dev/email-editor-editor';
import { GripVertical } from 'lucide-react';
import { useMemoizedFn } from 'ahooks';
import React, { useRef } from 'react';
import type { BlockType } from '@wa-dev/email-editor-blocks-react';
import styles from './index.module.scss';

export const BlockMaskWrapper: React.FC<{
  type: BlockType | string;
  payload: any;
  children: React.ReactNode | React.ReactElement;
}> = props => {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { type, payload } = props;

  const setDragHighlight = useMemoizedFn((active: boolean) => {
    if (!rootRef.current) return;
    rootRef.current.classList.toggle(styles.dragging, active);
  });

  const onDragStartCapture = useMemoizedFn(() => {
    setDragHighlight(true);
  });

  const onDragEndCapture = useMemoizedFn(() => {
    setDragHighlight(false);
  });

  const onHandleMouseDown: React.MouseEventHandler<HTMLDivElement> = useMemoizedFn(ev => {
    if (!dragRef.current || !dragRef.current.contains(ev.target as HTMLElement)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  return (
    <div
      ref={rootRef}
      className={styles.blockMaskRoot}
      onDragStartCapture={onDragStartCapture}
      onDragEndCapture={onDragEndCapture}
    >
      <BlockAvatarWrapper type={type} payload={payload}>
        <div className={styles.cardSurface}>
          <div className={styles.preview} data-drag-preview>
            {props.children}
          </div>
          <div
            ref={dragRef}
            className={styles.dragHandle}
            onMouseDown={onHandleMouseDown}
          >
            <IconFont
              icon={GripVertical}
              size={25}
              style={{ lineHeight: '25px', cursor: 'inherit' }}
            />
          </div>
        </div>
      </BlockAvatarWrapper>
    </div>
  );
};
