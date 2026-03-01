import React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export interface VirtualScrollResult {
  shouldUseVirtual: boolean;
  totalHeight: number;
  virtualItems: VirtualItem[];
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 50
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 判断是否需要使用虚拟滚动
  const shouldUseVirtual = useMemo(() => {
    return items.length > threshold;
  }, [items.length, threshold]);

  // 计算总高度
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!shouldUseVirtual) {
      return { start: 0, end: items.length - 1 };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { start, end };
  }, [shouldUseVirtual, scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 计算虚拟项目
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      });
    }

    return items;
  }, [visibleRange, itemHeight]);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollPosition = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldUseVirtual) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [shouldUseVirtual]);

  return {
    shouldUseVirtual,
    totalHeight,
    virtualItems,
    scrollToIndex,
    containerRef
  };
}

// VirtualItem 组件用于渲染虚拟项目
export interface VirtualItemProps {
  index: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export function VirtualItem({ index, style, children }: VirtualItemProps) {
  return (
    <div
      key={index}
      style={style}
      data-index={index}
    >
      {children}
    </div>
  );
}
