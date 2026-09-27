import React, { useMemo } from 'react';

import {
  BasicType,
  getPageIdx,
} from '@wa-dev/email-editor-blocks-react';
import { createPortal } from 'react-dom';
import {
  IconFont,
  useBlock,
  useFocusIdx,
  BlockAvatarWrapper,
  useFocusBlockLayout,
  getBlockNodeByIdx,
  getPageCanvasAnchorNode,
  isBlockNodeForIdx,
  getPluginElement,
  useEditorContext,
  resolveMoveSource,
} from '@wa-dev/email-editor-editor';
import { Move } from 'lucide-react';
import { Toolbar } from './Toolbar';
import { useBlockOverlayRect } from '../hooks/useBlockOverlayRect';

function resolveFocusAnchor(
  focusIdx: string,
  focusBlockNode: HTMLElement | null,
  isPage: boolean,
): HTMLElement | null {
  if (isPage) {
    const pageIdx = getPageIdx();
    return (
      getBlockNodeByIdx(pageIdx) ??
      getPageCanvasAnchorNode() ??
      focusBlockNode
    );
  }

  const liveNode = getBlockNodeByIdx(focusIdx);
  if (liveNode) {
    return liveNode;
  }

  if (
    focusBlockNode &&
    isBlockNodeForIdx(focusBlockNode, focusIdx)
  ) {
    return focusBlockNode;
  }

  return null;
}

export function FocusTooltip() {
  const { focusBlock, values } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { focusBlockNode } = useFocusBlockLayout();
  const { initialized } = useEditorContext();
  const pageIdx = getPageIdx();
  const isPage =
    focusIdx === pageIdx || focusBlock?.type === BasicType.PAGE;

  const moveSource = useMemo(() => {
    if (!focusBlock || !values?.content || !focusIdx || isPage) {
      return null;
    }
    return resolveMoveSource(values, focusIdx, focusBlock.type);
  }, [focusBlock, focusIdx, isPage, values]);

  const anchorNode = resolveFocusAnchor(focusIdx, focusBlockNode, isPage);
  const overlayRoot = initialized ? getPluginElement() : null;
  const overlayRefreshKey = isPage
    ? `${focusIdx}:${focusBlockNode ? 'ready' : 'pending'}`
    : focusIdx;
  const { rect, overlayRef } = useBlockOverlayRect(anchorNode, overlayRefreshKey);

  if (!overlayRoot || !rect || !anchorNode || !focusBlock) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      id='@wa-dev/email-editor-extensions-InteractivePrompt-FocusTooltip'
      style={{
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <div
        className='ee-focus-move-handle'
        style={{
          position: 'absolute',
          zIndex: 9999,
          right: 0,
          top: '50%',
          pointerEvents: 'auto',
          display: isPage || !moveSource ? 'none' : undefined,
        }}
      >
        {moveSource ? (
          <BlockAvatarWrapper
            idx={moveSource.idx}
            type={moveSource.type}
            action='move'
          >
            <div
              className='ee-block-drag-handle'
              style={
                {
                  position: 'absolute',
                  backgroundColor: 'var(--selected-color)',
                  color: '#ffffff',
                  height: '28px',
                  width: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  WebkitUserDrag: 'element',
                } as any
              }
            >
              <IconFont
                icon={Move}
                style={{ color: '#fff' }}
              />
            </div>
          </BlockAvatarWrapper>
        ) : null}
      </div>

      <div
        style={{
          position: 'absolute',
          fontSize: 14,
          zIndex: 1,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          outlineOffset: '-2px',
          outline: '2px solid var(--selected-color)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          fontSize: 14,
          zIndex: 10,
          left: 0,
          top: 0,
          width: '0%',
          height: '100%',
        }}
      >
        <Toolbar />
      </div>
    </div>,
    overlayRoot,
  );
}
