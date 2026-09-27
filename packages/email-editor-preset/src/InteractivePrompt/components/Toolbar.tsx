import React, { useEffect, useRef, useState } from 'react';
import { BasicType, getParentIdx } from '@wa-dev/email-editor-blocks-react';
import {
  useBlock,
  useFocusIdx,
  useEditorProps,
  getShadowRoot,
  isRichTextToolbarVisible,
  shouldPreserveInlineTextDom,
} from '@wa-dev/email-editor-editor';
import { useAddToCollection } from '@wa-dev/email-editor-panels';
import { CornerLeftUp, Copy, Star, Trash2, type LucideIcon } from 'lucide-react';
import { getBlockTitle } from '@extensions/utils/getBlockTitle';

export function Toolbar() {
  const toolbarButtonsRef = useRef<HTMLDivElement>(null);
  const { copyBlock, removeBlock, focusBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const props = useEditorProps();
  const [coveredByRichText, setCoveredByRichText] = useState(false);

  // 富文本编辑时隐藏块级 toolbar，避免与富文本 toolbar 叠两层
  useEffect(() => {
    const sync = () => {
      setCoveredByRichText(
        shouldPreserveInlineTextDom() || isRichTextToolbarVisible(),
      );
    };
    sync();
    const shadow = getShadowRoot();
    shadow?.addEventListener('focusin', sync);
    shadow?.addEventListener('focusout', sync);
    document.addEventListener('selectionchange', sync);
    return () => {
      shadow?.removeEventListener('focusin', sync);
      shadow?.removeEventListener('focusout', sync);
      document.removeEventListener('selectionchange', sync);
    };
  }, [focusIdx]);

  const isPage = focusBlock?.type === BasicType.PAGE;

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

  if (isPage || coveredByRichText) return null;
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
              size={12}
              icon={CornerLeftUp}
              onClick={handleSelectParent}
            />
            <ToolItem
              icon={Copy}
              onClick={handleCopy}
            />
            {props.onAddCollection && (
              <ToolItem
                icon={Star}
                onClick={handleAddToCollection}
              />
            )}
            <ToolItem
              icon={Trash2}
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
  icon: LucideIcon;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  size?: number;
}) {
  const IconComponent = props.icon;
  return (
    <div
      onClick={props.onClick}
      style={{
        color: '#ffffff',
        backgroundColor: 'var(--selected-color)',
        height: 22,
        width: 22,
        display: 'flex',
        pointerEvents: 'auto',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconComponent size={props.size || 14} />
    </div>
  );
}
