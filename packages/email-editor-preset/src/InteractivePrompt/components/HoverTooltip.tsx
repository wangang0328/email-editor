import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';

import {
  getNodeTypeFromClassName,
  getPageIdx,
} from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '../../utils/blockRegistry';
import { createPortal } from 'react-dom';
import {
  getBlockNodeByIdx,
  getEditorRoot,
  getPluginElement,
  isBlockNodeForIdx,
  useEditorContext,
  useFocusIdx,
  useHoverIdx,
  useLazyState,
} from '@wa-dev/email-editor-editor';
import { useBlockOverlayRect } from '../hooks/useBlockOverlayRect';

export function HoverTooltip() {
  const { hoverIdx, direction, isDragging } = useHoverIdx();
  const lazyHoverIdx = useLazyState(hoverIdx, isDragging ? 0 : 60);
  const { focusIdx } = useFocusIdx();
  const { initialized } = useEditorContext();
  const pageIdx = getPageIdx();

  const blockNode =
    lazyHoverIdx && lazyHoverIdx !== pageIdx
      ? getBlockNodeByIdx(lazyHoverIdx)
      : null;

  const block = useMemo(() => {
    if (!blockNode) {
      return null;
    }
    const type = getNodeTypeFromClassName(blockNode.classList);
    return type ? getBlockByType(type) : null;
  }, [blockNode]);

  const overlayRoot = initialized ? getPluginElement() : null;
  const { rect, overlayRef } = useBlockOverlayRect(
    blockNode && isBlockNodeForIdx(blockNode, lazyHoverIdx)
      ? blockNode
      : null,
    lazyHoverIdx ?? '',
  );

  const isTop = useMemo(() => {
    if (!initialized || !blockNode) {
      return false;
    }
    const rootBounds = getEditorRoot()?.getBoundingClientRect();
    if (!rootBounds) {
      return false;
    }
    return rootBounds.top === blockNode.getBoundingClientRect().top;
  }, [blockNode, initialized]);

  if (!initialized) {
    return null;
  }

  if (focusIdx === hoverIdx && !isDragging) {
    return null;
  }

  if (!lazyHoverIdx || lazyHoverIdx === pageIdx) {
    return null;
  }

  if (!blockNode || !block || !overlayRoot || !rect) {
    return null;
  }

  if (!isBlockNodeForIdx(blockNode, lazyHoverIdx)) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      id='@wa-dev/email-editor-extensions-InteractivePrompt-HoverTooltip'
      style={{
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <TipNode
        type={isDragging ? 'drag' : 'hover'}
        lineWidth={1}
        title={block.name}
        direction={isTop && direction === 'top' ? 'noEnoughTop' : direction}
        isDragging={isDragging}
      />
    </div>,
    overlayRoot,
  );
}

interface TipNodeProps {
  title: string;
  direction?: string;
  isDragging?: boolean;
  lineWidth: number;
  type: 'drag' | 'hover';
}

function TipNode(props: TipNodeProps) {
  const { direction, title, lineWidth, type } = props;
  const dragTitle = useMemo(() => {
    if (direction === 'top' || direction === 'noEnoughTop') {
      return `${t`在前面插入`} ${title}`;
    } else if (direction === 'bottom') {
      return `${t`在后面插入`} ${title}`;
    } else if (direction === 'right' || direction === 'left') {
      return t`拖拽到此处`;
    }
    return `${t`拖拽到`} ${title}`;
  }, [direction, title]);

  const color = useMemo(() => {
    if (type === 'drag') {
      return 'var(--drag-color, rgba(22, 93, 255, 0.45))';
    }
    return 'var(--hover-color, rgba(22, 93, 255, 0.2))';
  }, [type]);

  const labelBackgroundColor =
    type === 'drag' ? 'var(--selected-color, #165dff)' : color;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        fontSize: 14,
        zIndex: 1,
        color: '#1d2129',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        textAlign: 'left',
      }}
    >
      {/* outline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          outlineOffset: `-${lineWidth}px`,
          outline: `${lineWidth}px solid ${color}`,
        }}
      >
        {type === 'hover' && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          >
            <div
              style={{
                backgroundColor: labelBackgroundColor,
                color: '#ffffff',
                height: '22px',
                lineHeight: '22px',
                display: 'inline-flex',
                padding: '1px 5px',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                fontFamily: 'sans-serif',
                transform: 'translateY(-100%)',
              }}
            >
              {title}
            </div>
          </div>
        )}
      </div>

      {/* drag direction tip */}
      {props.isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            ...directionImage[props.direction || 'none'],
          }}
        >
          <div
            style={{
              position: 'absolute',
              color: '#ffffff',
              backgroundColor: labelBackgroundColor,
              lineHeight: '22px',
              display: 'inline-flex',
              maxWidth: '100%',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              padding: '1px 5px',

              ...positionStyleMap[props.direction || 'none'],
            }}
          >
            {dragTitle}
          </div>
        </div>
      )}
    </div>
  );
}

const positionStyleMap: Record<string, any> = {
  noEnoughTop: {
    top: '0%',
    left: '50%',
    padding: '1px 5px',
    transform: 'translate(-50%, 0%)',
  },
  top: {
    top: '0%',
    left: '50%',
    padding: '1px 5px',
    transform: 'translate(-50%, -50%)',
  },
  bottom: {
    top: '100%',
    left: '50%',
    padding: '1px 5px',
    transform: 'translate(-50%, -50%)',
  },
  left: {
    top: '50%',
    left: '0%',
    padding: '5px 1px',
    writingMode: 'vertical-lr',
    transform: 'translate(0, -50%)',
  },
  right: {
    top: '50%',
    right: '0%',
    padding: '5px 1px',
    writingMode: 'vertical-lr',
    transform: 'translate(0, -50%)',
  },
  none: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};

const directionImage: Record<string, any> = {
  top: {
    backgroundImage: `linear-gradient(
      to bottom,
      var(--drag-color, rgba(22, 93, 255, 0.45)) 3px,
      transparent 3px
    )`,
  },
  bottom: {
    backgroundImage: `linear-gradient(
      to top,
      var(--drag-color, rgba(22, 93, 255, 0.45)) 3px,
      transparent 3px
    )`,
  },
  left: {
    backgroundImage: `linear-gradient(
      to right,
      var(--drag-color, rgba(22, 93, 255, 0.45)) 3px,
      transparent 3px
    )`,
  },
  right: {
    backgroundImage: `linear-gradient(
      to left,
      var(--drag-color, rgba(22, 93, 255, 0.45)) 3px,
      transparent 3px
    )`,
  },
  none: {
    backgroundColor: 'var(--drag-color, rgba(22, 93, 255, 0.12))',
  },
};
