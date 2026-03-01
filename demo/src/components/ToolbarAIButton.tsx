/**
 * 聚焦块时 Toolbar 中的 AI 按钮：点击弹出输入框，输入优化内容后确定 → 打开侧边栏新会话并预填
 */
import React, { useState } from 'react';
import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { Popover, Input, Button } from '@arco-design/web-react';

export interface ToolbarAIButtonProps {
  /** 确定后回调：instruction + 当前聚焦的 idx/block，由父级打开侧边栏并传入 */
  onConfirm: (instruction: string, context: { focusIdx: string; focusBlock: unknown }) => void;
}

export function ToolbarAIButton({ onConfirm }: ToolbarAIButtonProps) {
  const { focusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    const text = inputValue.trim();
    if (!text) return;
    onConfirm(text, { focusIdx, focusBlock: focusBlock || null });
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
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          color: '#ffffff',
          backgroundColor: 'var(--selected-color)',
          height: 22,
          fontSize: 14,
          lineHeight: '22px',
          width: 22,
          display: 'flex',
          pointerEvents: 'auto',
          cursor: 'pointer',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        title="AI 优化"
      >
        ✨
      </div>
    </Popover>
  );
}
