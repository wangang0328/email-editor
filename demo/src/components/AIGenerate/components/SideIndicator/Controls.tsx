// src/components/SideIndicator/controls.tsx
import React from 'react';
import { ExpandIcon, CollapseIcon } from './Icons';

interface ControlsProps {
  expanded: boolean;
  onToggle: () => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  hasTopButton?: boolean;
  hasBottomButton?: boolean;
  showStats?: boolean;
  stats?: {
    total: number;
    user: number;
    assistant: number;
    errors: number;
  };
}

export const Controls: React.FC<ControlsProps> = ({
  expanded,
  onToggle,
  onScrollToTop,
  onScrollToBottom,
  hasTopButton = true,
  hasBottomButton = true,
  showStats = false,
  stats,
}) => {
  return (
    <div className="indicator-controls">
      <button
        className="indicator-toggle-btn"
        onClick={onToggle}
        aria-label={expanded ? '折叠导航栏' : '展开导航栏'}
        title={expanded ? '折叠' : '展开'}
      >
        {expanded ? <CollapseIcon /> : <ExpandIcon />}
      </button>

      {expanded && (
        <>
          {showStats && stats && (
            <div className="indicator-stats">
              <div className="stat-item">
                <span className="stat-label">总计</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item user-stat">
                <span className="stat-label">用户</span>
                <span className="stat-value">{stats.user}</span>
              </div>
              <div className="stat-item assistant-stat">
                <span className="stat-label">AI</span>
                <span className="stat-value">{stats.assistant}</span>
              </div>
              {stats.errors > 0 && (
                <div className="stat-item error-stat">
                  <span className="stat-label">错误</span>
                  <span className="stat-value">{stats.errors}</span>
                </div>
              )}
            </div>
          )}

          <div className="quick-actions">
            {hasTopButton && onScrollToTop && (
              <button
                className="quick-action-btn top-btn"
                onClick={onScrollToTop}
                aria-label="滚动到顶部"
                title="顶部"
              >
                ↑
              </button>
            )}

            {hasBottomButton && onScrollToBottom && (
              <button
                className="quick-action-btn bottom-btn"
                onClick={onScrollToBottom}
                aria-label="滚动到底部"
                title="底部"
              >
                ↓
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};