import React from 'react';
import { Button, Badge } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';

interface ScrollToBottomButtonProps {
  visible: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  unreadCount = 0,
  onClick
}) => {
  if (!visible) return null;

  const buttonContent = unreadCount > 0 ? (
    <div className="scroll-button-content">
      <IconDown />
      <span className="unread-text">
        {unreadCount > 99 ? '99+' : unreadCount}条新消息
      </span>
    </div>
  ) : (
    <IconDown />
  );

  return (
    <div className="scroll-to-bottom-container">
      <Button
        type="primary"
        shape={unreadCount > 0 ? 'round' : 'circle'}
        size="large"
        onClick={onClick}
        className={`scroll-to-bottom-button ${unreadCount > 0 ? 'with-count' : ''}`}
        title={unreadCount > 0 ? `${unreadCount}条新消息` : '滚动到底部'}
      >
        {buttonContent}
      </Button>
    </div>
  );
};
