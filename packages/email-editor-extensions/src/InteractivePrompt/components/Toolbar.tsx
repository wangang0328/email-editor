import React, { useRef } from 'react';
import { BasicType, getParentIdx, getSiblingIdx } from '@wa-dev/email-editor-core';
import {
  useBlock,
  useFocusIdx,
  useEditorProps,
  isTextBlock,
} from '@wa-dev/email-editor-editor';
import { classnames } from '@extensions/utils/classnames';
import { useAddToCollection } from '@extensions/hooks/useAddToCollection';
import { getBlockTitle } from '@extensions/utils/getBlockTitle';

export function Toolbar() {
  const toolbarButtonsRef = useRef<HTMLDivElement>(null);
  const { moveBlock, copyBlock, removeBlock, focusBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const props = useEditorProps();

  const isPage = focusBlock?.type === BasicType.PAGE;
  const isText = isTextBlock(focusBlock?.type);

  const handleMoveUp = () => {
    moveBlock(focusIdx, getSiblingIdx(focusIdx, -1));
  };

  const handleMoveDown = () => {
    moveBlock(focusIdx, getSiblingIdx(focusIdx, 1));
  };

  const handleAddToCollection = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setModalVisible(true);
  };

  const handleCopy: React.MouseEventHandler<HTMLDivElement> = ev => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    copyBlock(focusIdx);
  };

  const handleDelete = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    removeBlock(focusIdx);
  };

  const handleSelectParent = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setFocusIdx(getParentIdx(focusIdx)!);
  };

  if (isText) return null;
  return (
    <>
      <div
        id='email-editor-extensions-InteractivePrompt-Toolbar'
        style={{
          height: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: 14,
            lineHeight: '22px',
            pointerEvents: 'auto',
            color: '#ffffff',
            transform: 'translateY(-100%)',
            display: 'inline-flex',
            // justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              backgroundColor: 'var(--selected-color)',
              height: '22px',

              display: 'inline-flex',
              padding: '1px 5px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap',
              maxWidth: 300,
              overflow: 'hidden',
            }}
          >
            {focusBlock && getBlockTitle(focusBlock, false)}
          </div>
          <div
            ref={toolbarButtonsRef}
            onClick={e => {
              e.stopPropagation();
            }}
            onMouseDown={ev => {
              const target = ev.nativeEvent.target as Node;
              if (toolbarButtonsRef.current?.contains(target)) {
                ev.preventDefault();
              }
            }}
            style={{
              display: isPage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <ToolItem
              width={12}
              iconName='icon-back-parent'
              onClick={handleSelectParent}
            />
            <ToolItem
              iconName='icon-copy'
              onClick={handleCopy}
            />
            {props.onAddCollection && (
              <ToolItem
                iconName='icon-collection'
                onClick={handleAddToCollection}
              />
            )}
            <ToolItem
              iconName='icon-delete'
              onClick={handleDelete}
            />
            {props.toolbarItems && (
              <div
                className='wa-email-editor-extensions-block-toolbar-items'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: 2,
                  color: 'rgb(255, 255, 255)',
                  backgroundColor: 'var(--selected-color)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  height: '100%',
                }}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => {
                  const target = e.nativeEvent.target as Node;
                  if (e.currentTarget.contains(target)) {
                    e.preventDefault();
                  }
                }}
              >
                {props.toolbarItems}
              </div>
            )}
          </div>
        </div>
      </div>
      {modal}
    </>
  );
}

function ToolItem(props: {
  iconName: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  width?: number;
}) {
  return (
    <div
      onClick={props.onClick}
      style={{
        color: '#ffffff',
        backgroundColor: 'var(--selected-color)',
        height: 22,
        fontSize: props.width || 14,
        lineHeight: '22px',
        width: 22,
        display: 'flex',
        pointerEvents: 'auto',
        cursor: 'pointer',
        justifyContent: 'center',
      }}
      className={classnames('iconfont', props.iconName)}
    />
  );
}
