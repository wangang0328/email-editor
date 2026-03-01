import React from 'react';
import { createPortal } from 'react-dom';
import {
  getPluginElement,
  RICH_TEXT_BAR_ID,
  useEditorContext,
} from '@wa-dev/email-editor-editor';
import { Tools } from './components/Tools';
import styleText from './shadow-dom.scss?inline';

export interface RichTextToolBarProps {
  onChange: (s: string) => void;
  /** 从上层传入的 toolbar 配置（portal 内 useEditorProps 可能拿不到），保证 suffix 等能正确展示 */
  toolbar?: {
    suffix?: (execCommand: (cmd: string, value?: any) => void) => React.ReactNode;
  };
}

export function RichTextToolBar(props: RichTextToolBarProps) {
  const { onChange, toolbar } = props;
  const { initialized } = useEditorContext();
  const root = initialized && getPluginElement();

  if (!root) return null;

  return (
    <>
      {createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: styleText }} />
          <div
            id={RICH_TEXT_BAR_ID}
            style={{
              transform: 'translate(0,0)',
              padding: '4px 8px',
              boxSizing: 'border-box',
              position: 'absolute',
              left: 8,
              top: 0,
              zIndex: 100,
              width: 'calc(100% - 16px)',
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
              }}
            />
            <Tools
              onChange={onChange}
              toolbar={toolbar}
            />
          </div>
        </>,
        root,
      )}
    </>
  );
}
