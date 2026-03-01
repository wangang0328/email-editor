import { useState, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';

interface UseSmartScrollOptions {
  bottomProximity?: number;      // 接近底部的阈值
  userScrollIntent?: number;     // 用户滚动意图阈值
  resetTimeout?: number;         // 重置超时时间
  programmaticGrace?: number;    // 程序滚动保护期（很短，50ms）
  afterUserInteraction?: number; // 用户交互后保护期（300ms）
  minimumStableTime?: number;    // 最少稳定时间（100ms）
  autoScrollCheckInterval?: number; // 流式生成检查间隔
}

interface ProgrammaticScrollState {
  isActive: boolean;
  startTime: number;
  endTime: number;
  targetPosition: number;
  direction: 'up' | 'down' | 'none';
}

interface UserIntentState {
  lastScrollTime: number;
  lastScrollPosition: number;
  expectedPosition: number;
  hasInterrupted: boolean;
}

interface ScrollState {
  // 用户行为状态
  isUserInteracting: boolean;
  lastUserScrollTime: number;
  lastProgrammaticScrollTime: number;

  // 滚动位置状态
  lastScrollTop: number;
  lastScrollHeight: number;
  distanceFromBottom: number;

  // 智能判断状态
  autoScrollEnabled: boolean;
  userInterrupted: boolean;
  wasAtBottom: boolean;

  // 未读消息计数
  unreadCount: number;

  // 程序滚动状态
  programmaticScroll: ProgrammaticScrollState;

  // 用户意图状态
  userIntent: UserIntentState;
}

interface UseSmartScrollReturn {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  setContainerRef: (element: HTMLDivElement | null) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  userScrolledUp: boolean;
  showScrollToBottomButton: boolean;
  isStreaming: boolean;
  isAutoScrolling: boolean; // 是否在自动滚动
  unreadCount: number;
  smartScrollToBottom: () => void;
  scrollToBottom: () => void;
  scrollToMessage: (index: number) => void;
  startStreaming: () => void;
  endStreaming: () => void;
  resetScrollState: () => void;
  markNewMessage: () => void;
}

export const useSmartScroll = (
  messageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  options: UseSmartScrollOptions = {}
): UseSmartScrollReturn => {
  const {
    bottomProximity = 60,
    userScrollIntent = 3,
    resetTimeout = 1200,
    programmaticGrace = 50,  // 缩短到50ms
    afterUserInteraction = 300,
    minimumStableTime = 100,
    autoScrollCheckInterval = 500
  } = options;

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const cleanupListeners = useRef<(() => void) | null>(null);
  const isNearBottomRef = useRef(true); // 跟踪是否在底部附近
  const scrollRafId = useRef<number | null>(null); // 用于取消未执行的滚动
  const prevScrollHeightRef = useRef(0); // 保存上一次的 scrollHeight，用于 delta 计算

  // 状态管理
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false); // 是否在自动滚动

  // 滚动状态（使用ref避免闭包问题）
  const scrollState = useRef<ScrollState>({
    isUserInteracting: false,
    lastUserScrollTime: 0,
    lastProgrammaticScrollTime: 0,
    lastScrollTop: 0,
    lastScrollHeight: 0,
    distanceFromBottom: 0,
    autoScrollEnabled: true,
    userInterrupted: false,
    wasAtBottom: true,
    unreadCount: 0,
    programmaticScroll: {
      isActive: false,
      startTime: 0,
      endTime: 0,
      targetPosition: 0,
      direction: 'none'
    },
    userIntent: {
      lastScrollTime: 0,
      lastScrollPosition: 0,
      expectedPosition: 0,
      hasInterrupted: false
    }
  });

  // 判断是否应该自动滚动（改进版：保护期内也要检查用户意图）
  const shouldAutoScroll = useMemoizedFn(() => {
    const now = Date.now();
    const state = scrollState.current;
    const timeSinceUserScroll = now - state.lastUserScrollTime;
    const timeSinceProgrammatic = now - state.programmaticScroll.endTime;

    // 条件1: 用户最近没有手动滚动（超过重置时间）
    const noRecentUserScroll = timeSinceUserScroll > resetTimeout;

    // 条件2: 程序滚动还在保护期内
    const inProgrammaticGrace =
      state.programmaticScroll.isActive ||
      timeSinceProgrammatic < programmaticGrace;

    // 条件3: 用户最近是否有交互
    const recentlyUserInteracted =
      timeSinceUserScroll < afterUserInteraction;

    // 条件4: 用户当前就在底部附近
    const isNearBottom = state.distanceFromBottom <= bottomProximity;

    // 核心改进：保护期内也要检查用户意图
    if (inProgrammaticGrace) {
      // 只有在以下条件都满足时才允许自动滚动：
      // a) 程序滚动方向是向下的（用户希望看新内容）
      // b) 用户没有主动中断
      // c) 用户当前在底部附近

      const isScrollingDownForNewContent =
        state.programmaticScroll.direction === 'down';

      const hasUserInterrupted =
        state.userIntent.hasInterrupted;

      const isUserNearBottom =
        state.distanceFromBottom < 100;

      // 关键：保护期内也要尊重用户意图
      const shouldScroll = isScrollingDownForNewContent &&
                          !hasUserInterrupted &&
                          isUserNearBottom;

      return shouldScroll;
    }

    // 如果用户最近有交互，优先尊重用户
    if (recentlyUserInteracted && state.userIntent.hasInterrupted) {
      return false;
    }

    // 默认根据是否在底部判断
    if (!isNearBottom) {
      return false
    }
    return isNearBottom || noRecentUserScroll;
  });

  // 标记用户交互
  const markUserInteraction = useMemoizedFn((type: string) => {
    const now = Date.now();
    const container = containerRef.current;
    const state = scrollState.current;

    state.isUserInteracting = true;
    state.lastUserScrollTime = now;
    state.userInterrupted = true;
    state.autoScrollEnabled = false;

    // 记录用户意图状态
    if (container) {
      state.userIntent.lastScrollTime = now;
      state.userIntent.lastScrollPosition = container.scrollTop;
      state.userIntent.expectedPosition = container.scrollTop;
      state.userIntent.hasInterrupted = true;
    }

    // 如果程序滚动正在进行，标记为被用户中断
    if (state.programmaticScroll.isActive) {
      state.programmaticScroll.isActive = false;
    }
  });

  // 滚动事件处理
  const handleScroll = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const state = scrollState.current;

    // 计算重要指标
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const scrollDelta = scrollTop - state.lastScrollTop;
    const isScrollingUp = scrollDelta < -userScrollIntent;

    // 更新状态
    state.distanceFromBottom = distanceFromBottom;
    state.wasAtBottom = distanceFromBottom <= bottomProximity;
    // 更新是否在底部附近的 ref（用于快速检查）
    isNearBottomRef.current = distanceFromBottom <= bottomProximity;

    // 判断用户意图
    if (Math.abs(scrollDelta) > 1) { // 忽略微小抖动
      // 检测用户是否中断了程序滚动
      if (state.programmaticScroll.isActive) {
        const actualDelta = scrollTop - state.lastScrollTop;

        // 仅通过方向反转检测用户中断：
        // - 程序向下滚动时用户向上滚动 = 中断
        // - 程序向上滚动时用户向下滚动 = 中断
        // 不再使用 Math.abs(scrollTop - targetPosition) > 50，
        // 因为在 smooth scroll 动画过程中距离目标始终较远，会误判为中断
        if ((state.programmaticScroll.direction === 'down' && actualDelta < -5) ||
            (state.programmaticScroll.direction === 'up' && actualDelta > 5)) {
          markUserInteraction('interrupted-programmatic-scroll');
        }
      }

      if (!isProgrammaticScroll.current) {
        // 用户滚动时，取消自动滚动状态
        setIsAutoScrolling(false);
        if (isScrollingUp) {
          // 用户明确向上滚动
          markUserInteraction('scroll-up');
        } else if (distanceFromBottom <= bottomProximity) {
          // 用户滚动到底部附近，恢复自动滚动
          const now = Date.now();
          state.userInterrupted = false;
          state.userIntent.hasInterrupted = false;
          state.autoScrollEnabled = true;
          state.unreadCount = 0; // 清除未读计数
          // 用户回到底部，恢复自动滚动
        }
      }
    }

    // 更新UI状态
    const shouldShowButton = distanceFromBottom > 100 && state.userInterrupted;
    setShowScrollToBottomButton(shouldShowButton);

    state.lastScrollTop = scrollTop;
  });

  // 平滑滚动到底部
  const smoothScrollToBottom = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    const now = Date.now();
    const state = scrollState.current;
    // 修正：targetPosition 应为实际可达的最大 scrollTop（scrollHeight - clientHeight），
    // 而不是 scrollHeight，否则 checkScrollComplete 永远无法检测到 distance < 5
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const currentPosition = container.scrollTop;
    const direction = maxScrollTop > currentPosition ? 'down' : 'up';

    // 如果已经在底部，无需滚动
    if (Math.abs(maxScrollTop - currentPosition) < 5) {
      return;
    }

    // 标记为程序滚动
    isProgrammaticScroll.current = true;
    setIsAutoScrolling(true);
    state.lastProgrammaticScrollTime = now;

    // 记录程序滚动状态
    state.programmaticScroll.isActive = true;
    state.programmaticScroll.startTime = now;
    state.programmaticScroll.targetPosition = maxScrollTop;
    state.programmaticScroll.direction = direction;

    // 使用 requestAnimationFrame 确保在下一帧执行滚动，避免跳动
    if (scrollRafId.current !== null) {
      cancelAnimationFrame(scrollRafId.current);
    }

    scrollRafId.current = requestAnimationFrame(() => {
      container.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
      scrollRafId.current = null;

      // 监听滚动完成（通过检测是否到达目标位置）
      const checkScrollComplete = () => {
        const currentTop = container.scrollTop;
        const currentMaxScroll = container.scrollHeight - container.clientHeight;
        // 用当前最大 scrollTop 和实际 scrollTop 的差值来判断是否到底
        const distance = Math.abs(currentTop - currentMaxScroll);

        if (distance < 5 || !state.programmaticScroll.isActive) {
          // 滚动完成或已被用户中断
          state.programmaticScroll.isActive = false;
          state.programmaticScroll.endTime = Date.now();
          isProgrammaticScroll.current = false;
          setIsAutoScrolling(false);
        } else {
          // 继续检查
          requestAnimationFrame(checkScrollComplete);
        }
      };

      // 延迟开始检查，给滚动动画一些时间
      setTimeout(() => {
        requestAnimationFrame(checkScrollComplete);
      }, 150);
    });
  });

  // 立即滚动到底部（无动画）
  const scrollToBottomInstant = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    const now = Date.now();
    const state = scrollState.current;
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const currentPosition = container.scrollTop;
    const direction = maxScrollTop > currentPosition ? 'down' : 'up';

    // 标记为程序滚动
    isProgrammaticScroll.current = true;
    state.lastProgrammaticScrollTime = now;

    // 记录程序滚动状态
    state.programmaticScroll.isActive = true;
    state.programmaticScroll.startTime = now;
    state.programmaticScroll.targetPosition = maxScrollTop;
    state.programmaticScroll.direction = direction;

    container.scrollTop = maxScrollTop;

    // 立即完成（无动画）
    state.programmaticScroll.isActive = false;
    state.programmaticScroll.endTime = now;

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, programmaticGrace);
  });

  // 智能滚动控制（使用 scrollHeight delta 策略，参考 vo 实现）
  const smartScrollToBottom = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    // 检查是否在底部附近（快速检查，使用 ref）
    const isNearBottom = isNearBottomRef.current;

    // 如果不在底部附近，不自动滚动
    if (!isNearBottom) {
      scrollState.current.unreadCount += 1;
      setShowScrollToBottomButton(true);
      return;
    }

    // 检查是否应该自动滚动（完整判断）
    const shouldScroll = shouldAutoScroll();

    if (shouldScroll) {
      // 使用 scrollHeight delta 策略，避免与布局冲突
      const currentScrollHeight = container.scrollHeight;
      const delta = currentScrollHeight - prevScrollHeightRef.current;

      if (delta > 0) {
        // 内容增加了，使用 delta 更新 scrollTop
        container.scrollTop += delta;
        prevScrollHeightRef.current = currentScrollHeight;

        // 标记为程序滚动
        const now = Date.now();
        const state = scrollState.current;
        isProgrammaticScroll.current = true;
        setIsAutoScrolling(true);
        state.lastProgrammaticScrollTime = now;
        state.programmaticScroll.isActive = true;
        state.programmaticScroll.startTime = now;
        state.programmaticScroll.targetPosition = currentScrollHeight;
        state.programmaticScroll.direction = 'down';
      } else {
        // 内容没有增加，使用平滑滚动到底部
        smoothScrollToBottom();
      }
    } else {
      // 如果不自动滚动，增加未读计数
      scrollState.current.unreadCount += 1;
      setShowScrollToBottomButton(true);
    }
  });

  // 滚动到指定消息
  const scrollToMessage = useMemoizedFn((index: number) => {
    const messageElement = messageRefs.current[index];
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // 滚动到特定消息时，标记为用户交互
      markUserInteraction('navigate-to-message');
    }
  });

  // 开始流式生成
  const startStreaming = useMemoizedFn(() => {
    setIsStreaming(true);

    // 如果用户在底部，启用自动滚动
    if (scrollState.current.wasAtBottom) {
      scrollState.current.autoScrollEnabled = true;
    }

    // 设置周期性检查
    scrollCheckInterval.current = setInterval(() => {
      const shouldScroll = shouldAutoScroll();

      if (shouldScroll && scrollState.current.distanceFromBottom < 300) {
        // smoothScrollToBottom();
      }
    }, autoScrollCheckInterval);
  });

  // 结束流式生成
  const endStreaming = useMemoizedFn(() => {
    setIsStreaming(false);
    if (scrollCheckInterval.current) {
      clearInterval(scrollCheckInterval.current);
      scrollCheckInterval.current = null;
    }
  });

  // 重置滚动状态（仅重置用户交互相关状态，不影响进行中的程序滚动）
  const resetScrollState = useMemoizedFn(() => {
    const state = scrollState.current;
    state.userInterrupted = false;
    state.autoScrollEnabled = true;
    state.lastUserScrollTime = 0;
    state.unreadCount = 0;
    state.isUserInteracting = false;

    // 重置用户意图状态
    state.userIntent.lastScrollTime = 0;
    state.userIntent.lastScrollPosition = 0;
    state.userIntent.expectedPosition = 0;
    state.userIntent.hasInterrupted = false;

    // 注意：不重置 programmaticScroll 状态，
    // 因为 resetScrollState 常与 scrollToBottom 搭配使用，
    // 如果在此处清除 programmaticScroll.isActive，
    // 会导致 smoothScrollToBottom 的 checkScrollComplete 误判为完成，
    // 引起滚动条向上跳动。程序滚动状态由 smoothScrollToBottom/scrollToBottom 自行管理。

    setShowScrollToBottomButton(false);
  });

  // 标记新消息
  const markNewMessage = useMemoizedFn(() => {
    if (scrollState.current.userInterrupted) {
      scrollState.current.unreadCount += 1;
    }
  });

  // 设置容器 ref 的回调函数
  const setContainerRef = useMemoizedFn((element: HTMLDivElement | null) => {
    // 清理之前的事件监听器
    if (cleanupListeners.current) {
      cleanupListeners.current();
      cleanupListeners.current = null;
    }

    // 更新 ref
    containerRef.current = element;

    // 如果元素存在，立即设置事件监听器
    if (element) {
        cleanupListeners.current = setupEventListeners(element);
    }
  });

  // 提取事件监听器设置逻辑
  const setupEventListeners = useMemoizedFn((container: HTMLDivElement) => {
    // 1. 滚动事件（主判断）
    let scrollTimer: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 16); // 约60fps
    };
    container.addEventListener('scroll', debouncedHandleScroll, { passive: true });

    // 2. 鼠标滚轮事件（区分细微操作）
    const handleWheel = (e: WheelEvent) => {
      const isScrollingUp = e.deltaY < 0;
      if (isScrollingUp && Math.abs(e.deltaY) > 5) {
        markUserInteraction('wheel-up');
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: true });

    // 3. 触摸事件（移动端）
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // 负数表示向上滑动
      if (deltaY > 5) { // 向上滑动超过5px
        markUserInteraction('touch-up');
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 4. 键盘滚动（PageUp/Down, 方向键）
    const handleKeyScroll = (e: KeyboardEvent) => {
      if (['PageUp', 'ArrowUp', 'Home'].includes(e.key)) {
        markUserInteraction('key-up');
      }
    };
    document.addEventListener('keydown', handleKeyScroll);

    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyScroll);
      clearTimeout(scrollTimer);
    };
  });

  // 清理事件监听器
  useEffect(() => {
    return () => {
      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
      }
    };
  }, []);

  // 清理定时器和 RAF
  useEffect(() => {
    return () => {
      if (scrollCheckInterval.current) {
        clearInterval(scrollCheckInterval.current);
      }
      if (scrollRafId.current !== null) {
        cancelAnimationFrame(scrollRafId.current);
      }
    };
  }, []);

  return {
    containerRef,
    setContainerRef,
    messagesEndRef,
    userScrolledUp: scrollState.current.userInterrupted,
    showScrollToBottomButton,
    isStreaming,
    isAutoScrolling,
    unreadCount: scrollState.current.unreadCount,
    smartScrollToBottom,
    scrollToBottom: smoothScrollToBottom,
    scrollToMessage,
    startStreaming,
    endStreaming,
    resetScrollState,
    markNewMessage
  };
};
