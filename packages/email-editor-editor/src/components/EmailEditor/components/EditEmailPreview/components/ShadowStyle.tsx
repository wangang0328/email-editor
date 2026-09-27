import React from 'react';
import styles from '@/styles/block-shadowDom-interactive.css?inline';
import { useEditorProps } from '@/hooks/useEditorProps';

export function ShadowStyle() {
  const {
    interactiveStyle: {
      // Shadow DOM 内无 Arco 的 --primary-*，勿使用 rgb(var(--primary-x, #hex)) 形式
      hoverColor = 'rgba(22, 93, 255, 0.2)',
      selectedColor = '#165dff',
      dragoverColor = 'rgba(22, 93, 255, 0.45)',
    } = {},
  } = useEditorProps();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :host {
              display: block;
              height: 100%;
              width: 100%;
              font-size: 14px;
              line-height: 1.7;
              color: #1d2129;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              --primary: 221.2 83.2% 53.3%;
            }

            * {
              --hover-color: ${hoverColor};
              --drag-color: ${dragoverColor};
              --selected-color: ${selectedColor};
            }

            .shadow-container {
              height: 100%;
              overflow: overlay !important;
              background-color: #f7f8fa;
            }
            .shadow-container::-webkit-scrollbar {
              -webkit-appearance: none;
              width: 8px;
            }
            .shadow-container::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .shadow-container[data-dragging="true"]::-webkit-scrollbar-thumb {
              background-color: transparent;
            }


            ${styles}

            `,
        }}
      />
    </>
  );
}
