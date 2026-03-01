/**
 * 块级 / 富文本 Toolbar 共用的 AI 按钮：点击弹出输入框，输入完成后带内容打开侧边栏发送
 */
import React, { useState } from 'react';
import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { Popover, Input, Button } from '@arco-design/web-react';

export interface RichTextAIButtonProps {
  /** 确定后回调：打开侧边栏，context 含 focusIdx/focusBlock，initialMessage 为输入内容，由父级预填并发送 */
  onOpenSidebar: (context: { focusIdx: string; focusBlock: unknown; initialMessage?: string }) => void;
  /** 富文本 execCommand，可选：用于后续「仅优化选中片段」时替换内容 */
  execCommand?: (cmd: string, value?: string) => void;
  /**
   * Popover 挂载容器。富文本条内请传 FIXED_CONTAINER_ID 对应元素，否则点击输入框会触发「外部点击」导致 toolbar 消失；
   * 块级条请传 document.body，否则 toolbar 的 onMouseDown preventDefault 会阻止输入框获焦
   */
  getPopupContainer?: () => HTMLElement;
}

/** 用于 Toolbar 的 AI 图标（SVG） */
const AIIconSvg = (props: { width?: number; height?: number; className?: string }) => (
  <svg
    width={props.width ?? 16}
    height={props.height ?? 16}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={props.className}
  >
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="currentColor"
      fillOpacity="0.9"
    />
    <path
      d="M18 14L18.8 17L22 17.8L18.8 18.6L18 22L17.2 18.6L14 17.8L17.2 17L18 14Z"
      fill="currentColor"
      fillOpacity="0.7"
    />
    <path
      d="M6 16L6.6 18L9 18.6L6.6 19.2L6 22L5.4 19.2L3 18.6L5.4 18L6 16Z"
      fill="currentColor"
      fillOpacity="0.7"
    />
  </svg>
);

/* 仅保留布局与行为，背景/颜色由 toolbar 的 class 接管（.wa-email-editor-extensions-toolbar-suffix > * 或 .wa-email-editor-extensions-block-toolbar-items > *） */
const buttonStyle: React.CSSProperties = {
  marginLeft: 0,
  padding: '0 6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export function RichTextAIButton({ onOpenSidebar, getPopupContainer }: RichTextAIButtonProps) {
  const { focusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    const text = inputValue.trim();
    onOpenSidebar({
      focusIdx: focusIdx || '',
      focusBlock: focusBlock || null,
      initialMessage: text || undefined,
    });
    setInputValue('');
    setVisible(false);
  };

  const content = (
    <div style={{ width: 260, padding: 8 }}>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>✨ AI 优化</div>
      <Input.TextArea
        placeholder="输入优化内容，如：颜色改成红色、润色文案"
        value={inputValue}
        onChange={setInputValue}
        autoSize={{ minRows: 2, maxRows: 4 }}
        style={{ marginBottom: 8 }}
      />
      <Button type="primary" size="small" long onClick={handleConfirm}>
        确定
      </Button>
    </div>
  );

  return (
    <Popover
      trigger="click"
      position="bottom"
      content={content}
      popupVisible={visible}
      onVisibleChange={setVisible}
      getPopupContainer={getPopupContainer}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.preventDefault()}
        style={buttonStyle}
        title="AI 优化"
      >
        <AIIconSvg width={14} height={14} />
      </div>
    </Popover>
  );
}
