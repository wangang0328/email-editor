import React, { useRef, useCallback } from 'react';
import { ChatMessageDisplay } from '../types';
import { OptimizedMessage } from './OptimizedMessage';
import { EmptyState } from './EmptyState';
import { VirtualItem } from '../hooks/useVirtualScroll';
import { VirtualScrollbar, VirtualScrollbarRef } from './VirtualScrollbar';

interface MessageListProps {
  messages: ChatMessageDisplay[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  messagesListRef: React.RefObject<HTMLDivElement>;
  setContainerRef?: (element: HTMLDivElement | null) => void;
  scrollbarRef?: React.RefObject<VirtualScrollbarRef>;
  isAutoScrolling?: boolean; // 是否在自动滚动
  activeNodeIndex: number;
  cancelledMessageId: string | null;
  virtualScroll: {
    shouldUseVirtual: boolean;
    totalHeight: number;
    virtualItems: any[];
  };
  CONTAINER_HEIGHT: number;
  onCopy: (mjml: string) => void;
  onApply: (mjml: string) => void;
  onApplyPartial?: (blockData: unknown) => void;
  onMessageEdit: (messageId: string, newContent: string) => void;
  onCopyPrompt: (content: string) => void;
  onContinueGeneration: (messageId: string) => void;
  onSuggestionClick: (text: string) => void;
  getCachedRender: any;
  startRender: any;
  endRender: any;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  messagesEndRef,
  messageRefs,
  messagesListRef,
  setContainerRef,
  scrollbarRef,
  isAutoScrolling = false,
  activeNodeIndex,
  cancelledMessageId,
  virtualScroll,
  CONTAINER_HEIGHT,
  onCopy,
  onApply,
  onApplyPartial,
  onMessageEdit,
  onCopyPrompt,
  onContinueGeneration,
  onSuggestionClick,
  getCachedRender,
  startRender,
  endRender
}) => {
  // 优化的消息列表，使用 useMemo 避免不必要的重渲染
  const optimizedMessages = React.useMemo(() => {
    return messages.map((message, index) => ({
      ...message,
      index,
    }));
  }, [messages]);

  // 渲染优化的消息
  const renderOptimizedMessage = useCallback((msg: ChatMessageDisplay, index: number) => {
    const renderStart = startRender();

    const messageElement = getCachedRender(
      `${msg.id}-${msg.content.length}-${msg.isStreaming ? 's' : 'd'}`, // 包含流式状态确保切换时重新渲染
      msg.content,
      () => (
        <div
          key={msg.id}
          ref={(el) => {
            messageRefs.current[index] = el;
          }}
          className={`message-wrapper ${activeNodeIndex === index ? 'highlighted' : ''}`}
        >
          <OptimizedMessage
            message={msg}
            onCopy={onCopy}
            onApply={onApply}
            onApplyPartial={onApplyPartial}
            onEdit={(newContent) => onMessageEdit(msg.id, newContent)}
            onCopyPrompt={onCopyPrompt}
            onContinueGeneration={onContinueGeneration}
            isCancelled={cancelledMessageId === msg.id}
          />
        </div>
      ),
      msg.isStreaming ? 100 : 5000 // 流式消息缓存时间短，静态消息缓存时间长
    );

    endRender(renderStart);
    return messageElement;
  }, [activeNodeIndex, onCopy, onApply, onApplyPartial, onMessageEdit, onCopyPrompt, getCachedRender, startRender, endRender, cancelledMessageId, messageRefs, onContinueGeneration]);

  // 使用回调 ref 来同时设置两个 ref
  const handleRef = useCallback((element: HTMLDivElement | null) => {
    // 设置普通的 ref（保持向后兼容）
    if (messagesListRef && 'current' in messagesListRef) {
      (messagesListRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
    // 使用回调 ref（新方式，立即触发事件监听器设置）
    if (setContainerRef) {
      setContainerRef(element);
    }
  }, [messagesListRef, setContainerRef]);

  return (
    <div
      ref={handleRef}
      className={`messages-list ${virtualScroll.shouldUseVirtual ? 'virtual-enabled' : ''}`}
      style={virtualScroll.shouldUseVirtual ? { height: CONTAINER_HEIGHT } : undefined}
    >
      {/* 虚拟滚动条 */}
      <VirtualScrollbar ref={scrollbarRef} containerRef={messagesListRef} isAutoScrolling={isAutoScrolling} />
      {messages.length === 0 ? (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      ) : (
        <>
          {virtualScroll.shouldUseVirtual ? (
            // 虚拟滚动模式
            <div
              className="virtual-scroll-container"
              style={{ height: virtualScroll.totalHeight }}
            >
              {virtualScroll.virtualItems.map((virtualItem) => {
                const msg = optimizedMessages[virtualItem.index];
                return (
                  <VirtualItem
                    key={msg.id}
                    index={virtualItem.index}
                    style={{
                      position: 'absolute',
                      top: virtualItem.start,
                      height: virtualItem.end - virtualItem.start,
                      width: '100%',
                    }}
                  >
                    {renderOptimizedMessage(msg, virtualItem.index)}
                  </VirtualItem>
                );
              })}
            </div>
          ) : (
            // 正常滚动模式
            optimizedMessages.map((msg, index) => renderOptimizedMessage(msg, index))
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
