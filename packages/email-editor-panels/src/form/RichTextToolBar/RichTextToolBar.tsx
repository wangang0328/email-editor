import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getPluginElement,
  getBlockNodeByIdx,
  getShadowRoot,
  RICH_TEXT_BAR_ID,
  SYNC_SCROLL_ELEMENT_CLASS_NAME,
  useEditorContext,
  useFocusIdx,
} from '@wa-dev/email-editor-editor';
import { BasicTools } from './components/BasicTools';
import { Tools } from './components/Tools';
import styleText from './shadow-dom.scss?inline';

export interface RichTextToolBarProps {
  onChange: (s: string) => void;
  /** 是否展示块级操作（复制/删除/选父级），仅文本块启用 */
  blockTools?: boolean;
  /** 从上层传入的 toolbar 配置（portal 内 useEditorProps 可能拿不到），保证 suffix 等能正确展示 */
  toolbar?: {
    suffix?: (execCommand: (cmd: string, value?: any) => void) => React.ReactNode;
  };
}

const TOOLBAR_GAP = 8;
/** 相对块顶略下移，盖住块级 toolbar（约 22px）且不显得悬空过高 */
const COVER_BLOCK_TOOLBAR_OFFSET = 8;

function computePosition(
  pluginElement: HTMLElement,
  blockNode: HTMLElement,
  toolbarEl: HTMLElement | null,
): { top: number; left: number } {
  const blockRect = blockNode.getBoundingClientRect();
  const pluginRect = pluginElement.getBoundingClientRect();
  const toolbarHeight = toolbarEl?.offsetHeight || 36;
  const toolbarWidth = toolbarEl?.offsetWidth || 400;

  // 默认贴在块顶上方并下移，遮盖块级 toolbar
  let top =
    blockRect.top -
    pluginRect.top -
    toolbarHeight -
    TOOLBAR_GAP +
    COVER_BLOCK_TOOLBAR_OFFSET;
  if (top < 0) {
    top = blockRect.bottom - pluginRect.top + Math.max(TOOLBAR_GAP, 8);
  }

  let left = blockRect.left - pluginRect.left;
  const maxLeft = pluginRect.width - toolbarWidth - 8;
  left = Math.max(8, Math.min(left, maxLeft));

  return { top, left };
}

function useToolbarPosition(pluginElement: HTMLElement | null) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { focusIdx } = useFocusIdx();

  const applyPosition = useMemoizedFn(() => {
    const el = toolbarRef.current;
    if (!el || !pluginElement || !focusIdx) return;

    const blockNode = getBlockNodeByIdx(focusIdx);
    if (!blockNode) return;

    const { top, left } = computePosition(pluginElement, blockNode as HTMLElement, el);
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.visibility = 'visible';
  });

  useEffect(() => {
    applyPosition();
  }, [applyPosition, focusIdx]);

  useEffect(() => {
    if (!pluginElement) return;

    const shadow = getShadowRoot();
    const scrollContainer =
      shadow?.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`) ??
      pluginElement.parentElement?.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`);

    if (!scrollContainer) return;

    const onScroll = () => applyPosition();
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pluginElement, applyPosition]);

  return { toolbarRef };
}

export function RichTextToolBar(props: RichTextToolBarProps) {
  const { onChange, toolbar, blockTools } = props;
  const { initialized } = useEditorContext();
  const root = initialized && getPluginElement();

  const { toolbarRef } = useToolbarPosition(root || null);

  if (!root) return null;

  return (
    <>
      {createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: styleText }} />
          <div
            ref={toolbarRef}
            id={RICH_TEXT_BAR_ID}
            style={{
              padding: '4px 8px',
              boxSizing: 'border-box',
              position: 'absolute',
              left: 8,
              top: 0,
              // 高于 FocusTooltip（zIndex:1）内的块级 toolbar，实现遮盖
              zIndex: 200,
              width: 'auto',
              maxWidth: 'calc(100% - 16px)',
              visibility: 'hidden',
              overflow: 'visible',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                position: 'absolute',
                backgroundColor: '#41444d',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                borderRadius: 6,
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {blockTools ? <BasicTools /> : null}
              <Tools onChange={onChange} toolbar={toolbar} />
            </div>
          </div>
        </>,
        root,
      )}
    </>
  );
}
