import React, { memo } from 'react';
import { ChatMessageDisplay } from '../types';

interface MessageNodeProps {
  message: ChatMessageDisplay;
  isActive: boolean;
  onClick: () => void;
}

// 优化的消息节点组件
export const MessageNode = memo<MessageNodeProps>(({ message, isActive, onClick }) => {
  const isUser = message.role === 'user';
  return (
    <div
      className={`message-node ${isUser ? 'user' : 'assistant'} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={`${isUser ? '用户' : 'AI'}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`}
    >
      <div className="node-avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="node-index">{message.index! + 1}</div>
    </div>
  );
});

MessageNode.displayName = 'MessageNode';
