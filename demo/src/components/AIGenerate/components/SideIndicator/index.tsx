// src/components/SideIndicator/index.tsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { IndicatorProps, ChatMessage, RawChatMessage } from './interface'
import { IndicatorItem } from './IndicatorItem';
import { Controls } from './Controls';
import { useScrollSync } from './hooks/useScrollSync';
import { useOptimizedHover } from './hooks/useOptimizedHover';
import { useVirtualList } from './hooks/useVirtualList';
import './styles.css';

export const SideIndicator: React.FC<IndicatorProps> = ({
  messages = [],
  containerRef: externalContainerRef,
  onNavigate,
  className = '',
  expanded: controlledExpanded,
  defaultExpanded = true,
  showTooltips = true,
  showStats = true,
  maxHeight = '80vh',
  virtualizeThreshold = 50,
}) => {
  // 状态管理
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [activeIndex, setActiveIndex] = useState(0);
  const internalContainerRef = useRef<HTMLDivElement>(null);

  // 消息适配：将原始消息转换为指示器消息，只保留用户消息
  const adaptedMessages = useMemo((): ChatMessage[] => {
    return messages
      .map((msg, originalIndex) => ({ msg, originalIndex }))
      .filter(({ msg }) => msg.role === 'user') // 只显示用户消息的锚点
      .map(({ msg, originalIndex }): ChatMessage => ({
        id: msg.id,
        content: msg.content,
        type: msg.role as 'user' | 'assistant',
        timestamp: new Date(Date.now() - (messages.length - originalIndex) * 60000), // 模拟时间间隔
        isStreaming: msg.isStreaming,
        error: undefined, // 用户消息不会有错误
        metadata: {
          tokens: Math.ceil(msg.content.length / 4), // 更准确的token估算
          model: undefined, // 用户消息没有模型信息
          processingTime: undefined, // 用户消息没有处理时间
          originalIndex // 保存原始索引用于导航
        }
      }));
  }, [messages]);

  // 处理导航：将指示器索引转换为原始消息索引
  const handleIndicatorNavigate = useCallback((indicatorIndex: number) => {
    const userMessages = messages
      .map((msg, originalIndex) => ({ msg, originalIndex }))
      .filter(({ msg }) => msg.role === 'user');

    if (userMessages[indicatorIndex] && onNavigate) {
      onNavigate(userMessages[indicatorIndex].originalIndex);
    }
  }, [messages, onNavigate]);

  // 使用受控或非受控的expanded状态
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setExpanded = controlledExpanded !== undefined
    ? (() => {}) // 受控模式下不执行
    : setInternalExpanded;

  // 使用自定义hooks
  const { hoveredIndex, handleHoverStart, handleHoverEnd } = useOptimizedHover({
    delay: 150,
    immediateLeave: true,
  });

  const {
    registerMessageRef,
    scrollToMessage,
    cleanup
  } = useScrollSync(adaptedMessages.length, setActiveIndex);

  // 计算统计信息
  const stats = useMemo(() => {
    const userMessages = adaptedMessages.filter(m => m.type === 'user').length;
    const assistantMessages = adaptedMessages.filter(m => m.type === 'assistant').length;
    const errors = adaptedMessages.filter(m => !!m.error).length;

    return {
      total: adaptedMessages.length,
      user: userMessages,
      assistant: assistantMessages,
      errors,
    };
  }, [messages]);

  // 虚拟列表配置（使用适配后的消息）
  const shouldVirtualize = adaptedMessages.length > virtualizeThreshold;
  const virtualListOptions = {
    itemHeight: 48, // 每个指示器项的高度
    overscan: 5,
    containerHeight: typeof maxHeight === 'number' ? maxHeight : 600,
  };

  const {
    containerRef: virtualContainerRef,
    totalHeight,
    visibleItems,
    visibleRange,
    handleScroll,
    scrollToIndex,
    getItemOffset,
  } = useVirtualList(adaptedMessages, virtualListOptions);

  // 处理内部导航
  const handleInternalNavigate = useCallback((index: number) => {
    handleIndicatorNavigate(index);

    // 如果是虚拟列表，也滚动虚拟容器
    if (shouldVirtualize) {
      scrollToIndex(index);
    }
  }, [handleIndicatorNavigate, shouldVirtualize, scrollToIndex]);

  // 处理控制按钮事件
  const handleToggle = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const handleScrollToTop = useCallback(() => {
    handleInternalNavigate(0);
  }, [handleInternalNavigate]);

  const handleScrollToBottom = useCallback(() => {
    handleInternalNavigate(adaptedMessages.length - 1);
  }, [handleInternalNavigate, adaptedMessages.length]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!expanded) return;

      // Ctrl/Cmd + 方向键
      const isModifierPressed = e.ctrlKey || e.metaKey;

      if (isModifierPressed) {
        switch(e.key) {
          case 'ArrowUp':
            e.preventDefault();
            if (activeIndex > 0) {
              handleInternalNavigate(activeIndex - 1);
            }
            break;

          case 'ArrowDown':
            e.preventDefault();
            if (activeIndex < adaptedMessages.length - 1) {
              handleInternalNavigate(activeIndex + 1);
            }
            break;

          case 'Home':
            e.preventDefault();
            handleScrollToTop();
            break;

          case 'End':
            e.preventDefault();
            handleScrollToBottom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded, activeIndex, adaptedMessages.length, handleInternalNavigate, handleScrollToTop, handleScrollToBottom]);

  // 清理effect
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 渲染单个指示器项
  const renderIndicatorItem = useCallback((message: ChatMessage, index: number) => {
    // 如果是虚拟列表且不在可见范围内，返回占位符
    if (shouldVirtualize) {
      const isVisible = index >= visibleRange.start && index <= visibleRange.end;
      if (!isVisible) {
        return null;
      }
    }

    return (
      <IndicatorItem
        key={message.id}
        message={message}
        index={index}
        isActive={activeIndex === index}
        isHovered={hoveredIndex === index}
        onClick={handleInternalNavigate}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        showTooltip={showTooltips}
      />
    );
  }, [
    activeIndex,
    hoveredIndex,
    handleInternalNavigate,
    handleHoverStart,
    handleHoverEnd,
    showTooltips,
    shouldVirtualize,
    visibleRange,
  ]);

  // 渲染消息列表
  const renderMessageList = () => {
    if (shouldVirtualize) {
      return (
        <div
          ref={virtualContainerRef}
          className="virtual-indicator-list"
          style={{
            height: virtualListOptions.containerHeight,
            overflowY: 'auto',
          }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            {visibleItems.map((message, relativeIndex) => {
              const absoluteIndex = visibleRange.start + relativeIndex;
              const offset = getItemOffset(absoluteIndex);

              return (
                <div
                  key={message.id}
                  style={{
                    position: 'absolute',
                    top: offset,
                    left: 0,
                    width: '100%',
                    height: virtualListOptions.itemHeight,
                  }}
                >
                  {renderIndicatorItem(message, absoluteIndex)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 非虚拟列表
    return (
      <div className="indicator-list">
        {adaptedMessages.map((message, index) => (
          <div key={message.id} className="indicator-item-wrapper">
            {renderIndicatorItem(message, index)}
          </div>
        ))}
      </div>
    );
  };

  // 主容器类名
  const containerClassName = [
    'side-indicator',
    expanded ? 'side-indicator-expanded' : 'side-indicator-collapsed',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={internalContainerRef}
      className={containerClassName}
      style={{ maxHeight }}
      role="navigation"
      aria-label="对话导航指示器"
    >
      <div className="indicator-content">
        {renderMessageList()}
      </div>

      {/* <Controls
        expanded={expanded}
        onToggle={handleToggle}
        onScrollToTop={handleScrollToTop}
        onScrollToBottom={handleScrollToBottom}
        showStats={showStats && expanded}
        stats={stats}
      /> */}
    </div>
  );
};

export default SideIndicator;