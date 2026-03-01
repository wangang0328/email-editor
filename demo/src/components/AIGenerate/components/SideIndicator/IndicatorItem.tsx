// src/components/SideIndicator/IndicatorItem.tsx
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { IndicatorItemProps } from './interface';
import { UserIcon, AssistantIcon, ErrorIcon } from './Icons';
import { Tooltip } from './Tooltip';
import { truncateText } from './utils';

export const IndicatorItem: React.FC<IndicatorItemProps> = React.memo(({
  message,
  index,
  isActive,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showTooltip = true,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  // 处理悬停
  const handleMouseEnter = useCallback(() => {
    onMouseEnter(index);

    // 延迟显示tooltip
    if (showTooltip) {
      tooltipTimer.current = setTimeout(() => {
        setTooltipVisible(true);
      }, 300);
    }
  }, [index, onMouseEnter, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave();

    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }

    setTooltipVisible(false);
  }, [onMouseLeave]);

  // 处理点击
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(index);
  }, [index, onClick]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(index);
    }
  }, [index, onClick]);

  // 根据消息类型获取图标
  const renderIcon = () => {
    const iconProps = { size: 8 };

    if (message.error) {
      return <ErrorIcon {...iconProps} />;
    }

    if (message.type === 'user') {
      return <UserIcon {...iconProps} />;
    }

    return <AssistantIcon {...iconProps} />;
  };

  // 根据状态获取类名
  const getClassName = () => {
    const classes = ['indicator-item'];

    if (isActive) classes.push('indicator-item-active');
    if (isHovered) classes.push('indicator-item-hovered');
    if (message.error) classes.push('indicator-item-error');
    if (message.type === 'user') classes.push('indicator-item-user');
    if (message.type === 'assistant') classes.push('indicator-item-assistant');
    if (message.isStreaming) classes.push('indicator-item-streaming');

    return classes.join(' ');
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={itemRef}
        className={getClassName()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`跳转到第${index + 1}条消息：${truncateText(message.content, 30)}`}
        data-index={index}
        data-message-id={message.id}
        data-message-type={message.type}
      >
        <div className='indicator-message-content'>{message.content}</div>
        <div className="indicator-dot">
          <div className="indicator-dot-inner" />
        </div>
      </div>

      {showTooltip && (
        <Tooltip
          message={message}
          targetRef={itemRef}
          visible={tooltipVisible}
        />
      )}
    </>
  );
});

IndicatorItem.displayName = 'IndicatorItem';