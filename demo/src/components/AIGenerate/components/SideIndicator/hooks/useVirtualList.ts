// src/hooks/useVirtualList.ts
import { useRef, useCallback, useMemo } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

export const useVirtualList = <T>(items: T[], options: VirtualListOptions) => {
  const { itemHeight, overscan = 5, containerHeight } = options;
  const scrollTop = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop.current + containerHeight) / itemHeight) + overscan
    );

    return { start: startIndex, end: endIndex };
  }, [items.length, itemHeight, overscan, containerHeight, scrollTop.current]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop;
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollPosition = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [itemHeight]);

  const getItemOffset = useCallback((index: number) => {
    return index * itemHeight;
  }, [itemHeight]);

  return {
    containerRef,
    totalHeight,
    visibleItems,
    visibleRange,
    handleScroll,
    scrollToIndex,
    getItemOffset,
  };
};