// src/hooks/useOptimizedHover.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedHoverOptions {
  delay?: number;
  immediateLeave?: boolean;
  throttle?: boolean;
}

export const useOptimizedHover = (options: UseOptimizedHoverOptions = {}) => {
  const {
    delay = 150,
    immediateLeave = true,
    throttle = false,
  } = options;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef(false);
  const lastHoverTime = useRef(0);

  const clearTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const handleHoverStart = useCallback((index: number) => {
    clearTimer();

    // 节流处理
    if (throttle) {
      const now = Date.now();
      if (now - lastHoverTime.current < 100) {
        return;
      }
      lastHoverTime.current = now;
    }

    // 延迟处理
    isProcessing.current = true;
    hoverTimer.current = setTimeout(() => {
      setHoveredIndex(index);
      isProcessing.current = false;
    }, delay);
  }, [clearTimer, delay, throttle]);

  const handleHoverEnd = useCallback(() => {
    clearTimer();

    if (immediateLeave) {
      setHoveredIndex(null);
      isProcessing.current = false;
    } else {
      // 延迟离开
      hoverTimer.current = setTimeout(() => {
        setHoveredIndex(null);
        isProcessing.current = false;
      }, 100);
    }
  }, [clearTimer, immediateLeave]);

  // 强制设置hover状态
  const forceSetHover = useCallback((index: number | null) => {
    clearTimer();
    setHoveredIndex(index);
    isProcessing.current = false;
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    hoveredIndex,
    handleHoverStart,
    handleHoverEnd,
    forceSetHover,
    isProcessing: isProcessing.current,
  };
};