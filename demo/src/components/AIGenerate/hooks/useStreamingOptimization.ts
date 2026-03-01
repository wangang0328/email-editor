import { useCallback, useRef, useMemo } from 'react';

interface StreamingOptimizationOptions {
  batchSize?: number; // 批量更新大小
  debounceMs?: number; // 防抖延迟
  maxUpdatesPerSecond?: number; // 每秒最大更新次数
}

interface UpdateInfo {
  content: string;
  isAccumulative: boolean; // 是否是累积更新
}

interface StreamingOptimizationResult {
  optimizedUpdateContent: (messageId: string, newChunk: string) => void;
  flushUpdates: () => void;
  isOptimized: boolean;
}

export function useStreamingOptimization(
  updateMessages: (updater: (prev: any[]) => any[]) => void,
  options: StreamingOptimizationOptions = {}
): StreamingOptimizationResult {
  const {
    batchSize = 10,
    debounceMs = 50,
    maxUpdatesPerSecond = 30,
  } = options;

  // 批量更新队列
  const updateQueue = useRef<Map<string, UpdateInfo>>(new Map());
  const lastUpdateTime = useRef<number>(0);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);
  const frameId = useRef<number | null>(null);

  // 计算更新间隔
  const minUpdateInterval = 1000 / maxUpdatesPerSecond;

  // 刷新更新队列
  const flushUpdates = useCallback(() => {
    if (updateQueue.current.size === 0) return;

    const updates = new Map(updateQueue.current);
    updateQueue.current.clear();

    updateMessages((prev) =>
      prev.map((msg) => {
        const updateInfo = updates.get(msg.id);
        if (!updateInfo) return msg;

        // 根据更新类型决定如何更新内容
        const newContent = updateInfo.isAccumulative
          ? msg.content + updateInfo.content  // 累积更新
          : updateInfo.content;               // 完全替换

        return { ...msg, content: newContent };
      })
    );

    lastUpdateTime.current = Date.now();
  }, [updateMessages]);

  // 优化的内容更新函数
  const optimizedUpdateContent = useCallback((messageId: string, newChunk: string) => {
    // 获取当前累积的内容
    const currentUpdateInfo = updateQueue.current.get(messageId);
    const currentAccumulatedContent = currentUpdateInfo?.content || '';
    const updatedContent = currentAccumulatedContent + newChunk;

    // 更新队列，标记为累积更新
    updateQueue.current.set(messageId, {
      content: updatedContent,
      isAccumulative: false // 这里设为false，因为updatedContent已经是完整内容
    });

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;

    // 如果距离上次更新时间足够长，立即更新
    if (timeSinceLastUpdate >= minUpdateInterval) {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      frameId.current = requestAnimationFrame(flushUpdates);
    } else {
      // 否则使用防抖更新
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }
      updateTimer.current = setTimeout(flushUpdates, debounceMs);
    }
  }, [flushUpdates, debounceMs, minUpdateInterval]);

  // 清理定时器
  const cleanup = useCallback(() => {
    if (updateTimer.current) {
      clearTimeout(updateTimer.current);
      updateTimer.current = null;
    }
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = null;
    }
  }, []);

  // 判断是否启用优化
  const isOptimized = useMemo(() => {
    return maxUpdatesPerSecond > 0 && debounceMs > 0;
  }, [maxUpdatesPerSecond, debounceMs]);

  return {
    optimizedUpdateContent,
    flushUpdates,
    isOptimized,
  };
}

// 消息渲染优化 Hook
export function useMessageRenderOptimization() {
  const renderCache = useRef<Map<string, React.ReactElement>>(new Map());
  const lastRenderTime = useRef<Map<string, number>>(new Map());

  const getCachedRender = useCallback((
    messageId: string,
    content: string,
    renderFn: () => React.ReactElement,
    ttl: number = 1000 // 缓存时间
  ) => {
    const now = Date.now();
    const lastRender = lastRenderTime.current.get(messageId) || 0;

    // 如果缓存存在且未过期，返回缓存
    if (
      renderCache.current.has(messageId) &&
      now - lastRender < ttl
    ) {
      return renderCache.current.get(messageId)!;
    }

    // 重新渲染并缓存
    const rendered = renderFn();
    renderCache.current.set(messageId, rendered);
    lastRenderTime.current.set(messageId, now);

    return rendered;
  }, []);

  const clearCache = useCallback((messageId?: string) => {
    if (messageId) {
      renderCache.current.delete(messageId);
      lastRenderTime.current.delete(messageId);
    } else {
      renderCache.current.clear();
      lastRenderTime.current.clear();
    }
  }, []);

  return {
    getCachedRender,
    clearCache,
  };
}

// 性能监控 Hook
export function usePerformanceMonitor() {
  const metrics = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
  });

  const startRender = useCallback(() => {
    return performance.now();
  }, []);

  const endRender = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    const m = metrics.current;

    m.renderCount++;
    m.lastRenderTime = renderTime;
    m.averageRenderTime = (m.averageRenderTime * (m.renderCount - 1) + renderTime) / m.renderCount;
    m.maxRenderTime = Math.max(m.maxRenderTime, renderTime);

    // 如果渲染时间过长，发出警告
    if (renderTime > 16.67) { // 60fps 阈值
      console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
  }, []);

  const getMetrics = useCallback(() => {
    return { ...metrics.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metrics.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
    };
  }, []);

  return {
    startRender,
    endRender,
    getMetrics,
    resetMetrics,
  };
}
