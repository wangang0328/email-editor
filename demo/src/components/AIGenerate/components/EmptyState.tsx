import React from 'react';
import { Button } from '@arco-design/web-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    '生成一个节日促销邮件',
    '创建一个欢迎新用户的邮件',
    '设计一个产品上新通知',
  ];

  return (
    <div className="empty-state">
      <div className="empty-icon">💬</div>
      <div className="empty-title">开始对话</div>
      <div className="empty-desc">
        描述您想要的邮件模板，AI 会帮您生成
      </div>
      <div className="suggestions">
        <div className="suggestion-title">试试这些：</div>
        {suggestions.map((text, index) => (
          <Button
            key={index}
            type="outline"
            size="small"
            className="suggestion-btn"
            onClick={() => onSuggestionClick(text)}
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
};
