import React, { memo } from 'react';
import { Input, Tooltip } from '@arco-design/web-react';

/* ─── SVG 图标 ─── */

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ─── ChatInput 组件 ─── */

interface ImageGenStatus {
  status: string;
  message: string;
  current?: number;
  total?: number;
}

interface ChatInputProps {
  inputValue: string;
  loading: boolean;
  inputRef: React.RefObject<any>;
  imageGenStatus?: ImageGenStatus | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export const ChatInput = memo<ChatInputProps>(({
  inputValue,
  loading,
  inputRef,
  imageGenStatus,
  onInputChange,
  onSend,
  onCancel
}) => {
  const isGeneratingImages = imageGenStatus && ['analyzing', 'generating'].includes(imageGenStatus.status);
  
  return (
    <div className="input-area">
      {/* AI 思考中 / 图片生成提示条 */}
      {loading && (
        <div className={`thinking-bar ${isGeneratingImages ? 'image-gen' : ''}`}>
          {isGeneratingImages ? (
            <>
              <div className="thinking-bar-icon">
                <ImageIcon />
              </div>
              <span className="thinking-bar-text">
                {imageGenStatus.message}
                {imageGenStatus.current && imageGenStatus.total && (
                  <span className="progress-text">
                    ({imageGenStatus.current}/{imageGenStatus.total})
                  </span>
                )}
              </span>
              {imageGenStatus.total && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${((imageGenStatus.current || 0) / imageGenStatus.total) * 100}%` 
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="thinking-bar-dots">
                <span /><span /><span />
              </div>
              <span className="thinking-bar-text">AI 正在思考中...</span>
            </>
          )}
        </div>
      )}

      <div className="input-wrapper">
        <Input.TextArea
          ref={inputRef}
          placeholder="描述您想要的邮件模板，按 Enter 发送..."
          value={inputValue}
          onChange={onInputChange}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
      </div>

      <Tooltip content={loading ? '停止生成' : '发送消息'}>
        <button
          className={`send-btn ${loading ? 'cancel' : ''}`}
          onClick={loading ? onCancel : onSend}
          disabled={!loading && !inputValue.trim()}
        >
          {loading ? <StopIcon /> : <SendIcon />}
        </button>
      </Tooltip>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
