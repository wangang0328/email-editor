import React, { useState, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Button, Drawer, Message, Space } from '@arco-design/web-react';
import { IconPlus, IconHistory } from '@arco-design/web-react/icon';
import services from '@demo/services';
import { Conversation } from '@demo/services/ai';
import { useVirtualScroll } from './hooks/useVirtualScroll';
import { useMessageRenderOptimization, usePerformanceMonitor } from './hooks/useStreamingOptimization';
import { extractMJMLFromContent, isMjmlComplete, repairIncompleteMjml } from './utils/mjmlExtractor';
import './styles.scss';
import SideIndicator from './components/SideIndicator';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { ConversationHistory } from './components/ConversationHistory';
import { ScrollToBottomButton } from './components/ScrollToBottomButton';
import { useSmartScroll } from './hooks/useSmartScroll';
import { ChatMessageDisplay } from './types';
import { VirtualScrollbarRef } from './components/VirtualScrollbar';

interface AIGenerateProps {
  onGenerate: (mjml: string) => void;
  /** 受控：是否打开抽屉 */
  visible?: boolean;
  /** 受控：关闭回调 */
  onClose?: () => void;
  /** 受控时点击「AI 生成」按钮请求打开抽屉 */
  onOpenRequest?: () => void;
  /** 从 Toolbar AI 进入时预填的首条消息（新会话） */
  initialMessage?: string;
  /** 局部优化上下文，发送时带给服务端 */
  partialContext?: { focusIdx: string; focusBlock: unknown };
  /** 局部优化结果应用（应用当前块） */
  onApplyPartial?: (blockData: unknown) => void;
  /** 获取当前邮件 content JSON，用于解析移动等指令 */
  getContentJSON?: () => unknown;
  /** 执行块操作指令（如 move_block），由编辑器执行 moveBlock(fromIdx, toIdx) */
  onExecuteInstructions?: (
    instructions: Array<{ type: string; fromIdx?: string; toIdx?: string }>,
  ) => void;
}

export function AIGenerate({
  onGenerate,
  visible: controlledVisible,
  onClose,
  onOpenRequest,
  initialMessage,
  partialContext,
  onApplyPartial,
  getContentJSON,
  onExecuteInstructions,
}: AIGenerateProps) {
  // 抽屉状态（非受控时使用内部状态）
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible;
  const setVisible = useMemoizedFn((v: boolean) => {
    if (controlledVisible === undefined) setInternalVisible(v);
    if (!v) onClose?.();
  });
  const [historyVisible, setHistoryVisible] = useState(false);

  // 会话状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);

  // 输入状态
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  // 图片生成状态
  const [imageGenStatus, setImageGenStatus] = useState<{
    status: string;
    message: string;
    current?: number;
    total?: number;
  } | null>(null);

  // 取消生成控制
  const abortControllerRef = useRef<AbortController | null>(null);

  // 当前生成的 MJML
  const [currentMjml, setCurrentMjml] = useState<string | null>(null);

  // 节点导航状态
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(-1);
  const [showNodeNav, setShowNodeNav] = useState(false);

  // 取消状态
  const [cancelledMessageId, setCancelledMessageId] = useState<string | null>(null);

  // 消息列表滚动引用
  const inputRef = useRef<any>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollbarRef = useRef<VirtualScrollbarRef>(null);

  // 性能优化 Hooks
  const { getCachedRender, clearCache } = useMessageRenderOptimization();
  const { startRender, endRender, getMetrics } = usePerformanceMonitor();

  // 虚拟滚动配置
  const ITEM_HEIGHT = 120; // 预估消息高度
  const CONTAINER_HEIGHT = 400; // 容器高度

  const virtualScroll = useVirtualScroll(messages, {
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    overscan: 3,
    threshold: 30, // 30条消息以上启用虚拟滚动
  });

  // 使用智能滚动hook
  const smartScroll = useSmartScroll(messageRefs, {
    bottomProximity: 60,
    userScrollIntent: 3,
    resetTimeout: 1200,
    programmaticGrace: 50,  // 程序滚动保护期（很短，50ms）
    afterUserInteraction: 300, // 用户交互后保护期（300ms）
    minimumStableTime: 100,   // 最少稳定时间（100ms）
    autoScrollCheckInterval: 500
  });

  // 滚动到指定消息（增强版）
  const scrollToMessage = useMemoizedFn((index: number) => {
    if (virtualScroll.shouldUseVirtual) {
      // 虚拟滚动模式下使用 scrollToIndex
      virtualScroll.scrollToIndex(index);
    } else {
      // 使用智能滚动的方法
      smartScroll.scrollToMessage(index);
    }
    setActiveNodeIndex(index);
    // 3秒后取消高亮
    setTimeout(() => setActiveNodeIndex(-1), 3000);
  });

  // 处理消息编辑
  const handleMessageEdit = useMemoizedFn((messageId: string, newContent: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    );
    // 清除编辑消息的缓存
    clearCache(messageId);
    Message.success('消息已更新');
  });

  // 处理复制提示词
  const handleCopyPrompt = useMemoizedFn((content: string) => {
    setInputValue(content);
    inputRef.current?.focus();
    Message.success('提示词已复制到输入框');
  });

  // 加载会话列表
  const loadConversations = useMemoizedFn(async () => {
    try {
      const list = await services.conversations.list();
      setConversations(list);
    } catch (error) {
      console.error('加载会话列表失败:', error);
    }
  });

  // 创建新会话
  const createNewConversation = useMemoizedFn(async () => {
    try {
      const conversation = await services.conversations.create();
      setCurrentConversationId(conversation.id);
      setMessages([]);
      setCurrentMjml(null);
      await loadConversations();
      return conversation.id;
    } catch (error) {
      console.error('创建会话失败:', error);
      Message.error('创建会话失败');
      return null;
    }
  });

  // 加载会话详情
  const loadConversation = useMemoizedFn(async (id: string) => {
    try {
      const conversation = await services.conversations.get(id);
      setCurrentConversationId(id);
      const messages = conversation.messages || [];
      const messagesWithIndex = messages.map((msg, index) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        mjml: msg.mjml,
        index,
      }));
      setMessages(messagesWithIndex);
      // 重置消息引用数组
      messageRefs.current = new Array(messagesWithIndex.length).fill(null);
      // 找到最后一个有 MJML 的消息
      const lastMjmlMessage = [...messages]
        .reverse()
        .find((m) => m.mjml);
      setCurrentMjml(lastMjmlMessage?.mjml || null);
      setHistoryVisible(false);
      setShowNodeNav(messagesWithIndex.length > 3); // 超过3条消息显示节点导航
      requestAnimationFrame(() => {
        smartScroll.smartScrollToBottom();
      });
    } catch (error) {
      console.error('加载会话失败:', error);
      Message.error('加载会话失败');
    }
  });

  // 删除会话
  const deleteConversation = useMemoizedFn(async (id: string) => {
    try {
      await services.conversations.delete(id);
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
        setCurrentMjml(null);
      }
      await loadConversations();
      Message.success('会话已删除');
    } catch (error) {
      console.error('删除会话失败:', error);
      Message.error('删除会话失败');
    }
  });

  // 取消生成
  const handleCancelGeneration = useMemoizedFn(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setStreamingContent('');

    // 更新最后一条消息，移除流式状态并记录取消状态
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        setCancelledMessageId(lastMessage.id);
        return prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, isStreaming: false, content: msg.content + ' [已取消]' }
            : msg
        );
      }
      return prev;
    });

    Message.info('已取消生成');
  });

  // 继续生成
  const handleContinueGeneration = useMemoizedFn(async (messageId: string) => {
    if (loading) return;

    setLoading(true);
    setStreamingContent('');
    setCancelledMessageId(null);
    smartScroll.startStreaming();

    // 移除取消标记
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: msg.content.replace(' [已取消]', ''), isStreaming: true }
          : msg
      )
    );

    // 创建新的取消控制器
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 继续生成，使用"请继续"作为提示
      await services.ai.generateStream(
        currentConversationId,
        '请继续生成',
        // onChunk
        (chunk: string) => {
          setStreamingContent((prev) => prev + chunk);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        (fullContent: string, mjml: string | null, newConversationId?: string, serverIsComplete?: boolean, blockData?: unknown, intercepted?: boolean) => {
          let finalMjml = mjml;
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== messageId) return msg;
              const content = intercepted ? fullContent : (msg.content || fullContent);
              if (!intercepted && !finalMjml) finalMjml = extractMJMLFromContent(content);
              if (!intercepted && finalMjml) {
                const completeness = isMjmlComplete(finalMjml);
                if (!completeness.isComplete || serverIsComplete === false) {
                  const repaired = repairIncompleteMjml(finalMjml);
                  if (repaired) finalMjml = repaired;
                }
              }
              return {
                ...msg,
                content,
                mjml: intercepted ? (finalMjml ?? null) : (finalMjml || msg.mjml),
                isStreaming: false,
                ...(blockData !== undefined && { blockData }),
              };
            })
          );
          if (finalMjml) setCurrentMjml(finalMjml);
          if (newConversationId && newConversationId !== currentConversationId) {
            setCurrentConversationId(newConversationId);
          }
          setLoading(false);
          setStreamingContent('');
          smartScroll.endStreaming();
          loadConversations();
        },
        (error: string) => {
          Message.error(error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: `错误: ${error}`, isStreaming: false }
                : msg
            )
          );
          setLoading(false);
          setStreamingContent('');
          smartScroll.endStreaming();
        },
        abortController
      );
    } catch (error: any) {
      Message.error(error.message || '继续生成失败');
      setLoading(false);
      smartScroll.endStreaming(); // 结束流式生成
    }
  });

  // 发送消息
  const handleSend = useMemoizedFn(async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);
    setStreamingContent('');
    smartScroll.startStreaming();

    // 使用当前会话 ID，如果没有则传 null，让服务端创建
    let convId = currentConversationId;

    // 添加用户消息到界面
    const userMsgId = `user-${Date.now()}`;
    const userMsgIndex = messages.length;
    setMessages((prev) => {
      const newMessages = [
        ...prev,
        {
          id: userMsgId,
          role: 'user' as const,
          content: userMessage,
          index: userMsgIndex,
        },
      ];
      // 扩展消息引用数组
      messageRefs.current = [...messageRefs.current, null];
      return newMessages;
    });

    // 添加助手消息占位
    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsgIndex = messages.length + 1;
    setMessages((prev) => {
      const newMessages = [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant' as const,
          content: '',
          isStreaming: true,
          index: assistantMsgIndex,
        },
      ];
      // 扩展消息引用数组
      messageRefs.current = [...messageRefs.current, null];
      setShowNodeNav(newMessages.length > 3);

      // 标记新消息
      smartScroll.markNewMessage();

      return newMessages;
    });

    // 新消息添加后立即滚动到底部
    requestAnimationFrame(() => {
      smartScroll.scrollToBottom();
    });

    // 有选中块且能拿到 content 时，并行解析移动等指令并执行
    if (partialContext && getContentJSON && onExecuteInstructions) {
      const contentJSON = getContentJSON();
      if (contentJSON != null) {
        services.ai
          .getBlockInstructions({ message: userMessage, contentJSON })
          .then(({ instructions }) => {
            const moveInstructions = instructions.filter(
              (i) => i.type === 'move_block' && i.fromIdx != null && i.toIdx != null,
            );
            if (moveInstructions.length > 0) {
              onExecuteInstructions(moveInstructions);
              Message.success(`已执行 ${moveInstructions.length} 个移动操作`);
            }
          })
          .catch(() => {});
      }
    }

    // 创建取消控制器
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await services.ai.generateStream(
        convId,
        userMessage,
        // onChunk - 直接更新消息内容
        (chunk: string) => {
          setStreamingContent((prev) => prev + chunk);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        // onDone - 支持局部优化时写入 blockData
        (fullContent: string, mjml: string | null, newConversationId?: string, serverIsComplete?: boolean, blockData?: unknown, intercepted?: boolean) => {
          let finalMjml = mjml;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== assistantMsgId) return msg;
              // 后处理拦截：整条消息替换为服务端下发的模板文案，不再使用已流式展示的内容
              const content = intercepted ? fullContent : (msg.content || fullContent);
              if (!intercepted) {
                if (!finalMjml) {
                  finalMjml = extractMJMLFromContent(content);
                }
                if (finalMjml) {
                  const completeness = isMjmlComplete(finalMjml);
                  if (!completeness.isComplete || serverIsComplete === false) {
                    const repaired = repairIncompleteMjml(finalMjml);
                    if (repaired) finalMjml = repaired;
                    if (repaired && !isMjmlComplete(repaired).isComplete) {
                      Message.warning('MJML 模板可能不完整，建议发送「请继续生成」补全');
                    }
                  }
                }
              }
              return {
                ...msg,
                content,
                mjml: intercepted ? (finalMjml ?? null) : (finalMjml || msg.mjml),
                isStreaming: false,
                ...(blockData !== undefined && { blockData }),
              };
            })
          );
          if (finalMjml) setCurrentMjml(finalMjml);
          if (newConversationId && newConversationId !== convId) {
            setCurrentConversationId(newConversationId);
          }
          setLoading(false);
          setStreamingContent('');
          setImageGenStatus(null);
          smartScroll.endStreaming();
          loadConversations();
        },
        (error: string) => {
          Message.error(error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: `错误: ${error}`, isStreaming: false }
                : msg
            )
          );
          setLoading(false);
          setStreamingContent('');
          setImageGenStatus(null);
          smartScroll.endStreaming();
        },
        abortController,
        {
          ...(partialContext && {
            blockContext: {
              focusIdx: partialContext.focusIdx,
              blockData: partialContext.focusBlock,
              blockType: partialContext.focusBlock && typeof (partialContext.focusBlock as any)?.type === 'string' ? (partialContext.focusBlock as any).type : undefined,
            },
          }),
          onStatus: (status, message, total) => {
            setImageGenStatus({ status, message, total });
            if (status === 'completed') Message.success('图片生成完成');
            else if (status === 'error') Message.warning(`图片生成失败: ${message}`);
          },
          onProgress: (current, total, placeholder, description) => {
            setImageGenStatus(prev => ({
              ...prev!,
              status: 'generating',
              message: `正在生成: ${description}`,
              current,
              total
            }));
          },
          onImageGenerated: (placeholder, success, error) => {
            if (success) console.log(`图片 ${placeholder} 生成成功`);
            else console.warn(`图片 ${placeholder} 生成失败:`, error);
          },
        }
      );
    } catch (error: any) {
      Message.error(error.message || '发送失败');
      setLoading(false);
      setImageGenStatus(null); // 清除图片生成状态
      smartScroll.endStreaming(); // 结束流式生成
    }
  });

  // 应用 MJML 到编辑器
  const handleApply = useMemoizedFn((mjml: string) => {
    onGenerate(mjml);
    Message.success('已应用到编辑器');
  });

  // 复制 MJML 代码
  const handleCopy = useMemoizedFn((mjml: string) => {
    navigator.clipboard.writeText(mjml).then(() => {
      Message.success('已复制到剪贴板');
    }).catch(() => {
      Message.error('复制失败');
    });
  });

  // 打开抽屉时加载会话列表
  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  // 从 Toolbar AI 进入：预填首条消息并新开会话
  useEffect(() => {
    if (visible && initialMessage?.trim()) {
      setInputValue(initialMessage);
      createNewConversation();
      inputRef.current?.focus();
    }
  }, [visible, initialMessage]);

  // 性能监控（仅在开发环境下输出）
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const interval = setInterval(() => {
      const metrics = getMetrics();
      if (metrics.maxRenderTime > 16.67) {
        console.warn('[性能] 渲染较慢:', `最大 ${metrics.maxRenderTime.toFixed(1)}ms`);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getMetrics]);

  // 组件卸载时清理缓存
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  // 流式生成时自动滚动到底部（仅当用户在底部附近时）
  useEffect(() => {
    if (!loading) return;
    const container = smartScroll.containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // 仅在距离底部较近时自动滚动，避免干扰用户翻阅
    if (distanceFromBottom < 80) {
      // 直接设置 scrollTop 到底部，不使用 delta 策略减少跳动
      container.scrollTop = container.scrollHeight;
    }
  }, [streamingContent, loading]);

  // 流式生成开始时确保滚动到底部
  useEffect(() => {
    if (loading && smartScroll.containerRef.current) {
      requestAnimationFrame(() => {
        if (smartScroll.containerRef.current) {
          smartScroll.containerRef.current.scrollTop = smartScroll.containerRef.current.scrollHeight;
        }
      });
    }
  }, [loading]);

  // 智能滚动 - 使用新的hook处理
  useEffect(() => {
    // 只在新消息添加时滚动（流式生成时由上面的 useEffect 处理）
    if (messages.length > 0 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        smartScroll.smartScrollToBottom();
      }
    }
  }, [messages.length, loading, smartScroll]);

  const handleOpenDrawer = () => {
    if (onOpenRequest) onOpenRequest();
    else setVisible(true);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={handleOpenDrawer}
        style={{ marginRight: 8 }}
      >
        ✨ AI 生成
      </Button>

      <Drawer
        title={
          <div className="drawer-title">
            <span>✨ AI 邮件助手</span>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<IconHistory />}
                onClick={() => setHistoryVisible(true)}
              >
                历史
              </Button>
              <Button
                type="text"
                size="small"
                icon={<IconPlus />}
                onClick={createNewConversation}
              >
                新会话
              </Button>
            </Space>
          </div>
        }
        visible={visible}
        onCancel={() => setVisible(false)}
        width={640}
        placement="right"
        footer={null}
        className="ai-generate-drawer"
      >
        <div className="chat-container">
          {/* 右侧指示器 */}
          <SideIndicator
            messages={messages}
            onNavigate={scrollToMessage}
            defaultExpanded={true}
            showTooltips={true}
            showStats={true}
            maxHeight="70vh"
            virtualizeThreshold={10}
          />

          {/* 消息列表 */}
          <MessageList
            messages={messages}
            messagesEndRef={smartScroll.messagesEndRef}
            messageRefs={messageRefs}
            messagesListRef={smartScroll.containerRef}
            setContainerRef={smartScroll.setContainerRef}
            scrollbarRef={scrollbarRef}
            isAutoScrolling={smartScroll.isAutoScrolling}
            activeNodeIndex={activeNodeIndex}
            cancelledMessageId={cancelledMessageId}
            virtualScroll={virtualScroll}
            CONTAINER_HEIGHT={CONTAINER_HEIGHT}
            onCopy={handleCopy}
            onApply={handleApply}
            onApplyPartial={onApplyPartial}
            onMessageEdit={handleMessageEdit}
            onCopyPrompt={handleCopyPrompt}
            onContinueGeneration={handleContinueGeneration}
            onSuggestionClick={(text) => {
              setInputValue(text);
              inputRef.current?.focus();
            }}
            getCachedRender={getCachedRender}
            startRender={startRender}
            endRender={endRender}
          />

          {/* 滚动到底部按钮 */}
          <ScrollToBottomButton
            visible={smartScroll.showScrollToBottomButton}
            unreadCount={smartScroll.unreadCount}
            onClick={() => {
              // 先重置用户中断状态，再启动平滑滚动
              // 顺序很重要：resetScrollState 会清除 programmaticScroll 状态，
              // 必须在 scrollToBottom 设置新的程序滚动状态之前调用
              smartScroll.resetScrollState();
              smartScroll.scrollToBottom();
            }}
          />

          {/* 输入区域 */}
          <ChatInput
            inputValue={inputValue}
            loading={loading}
            inputRef={inputRef}
            imageGenStatus={imageGenStatus}
            onInputChange={setInputValue}
            onSend={handleSend}
            onCancel={handleCancelGeneration}
          />
        </div>
      </Drawer>

      {/* 历史会话抽屉 */}
      <ConversationHistory
        visible={historyVisible}
        conversations={conversations}
        onClose={() => setHistoryVisible(false)}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />
    </>
  );
}
