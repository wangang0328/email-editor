import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import './VirtualScrollbar.scss';
import '../styles.scss';

interface VirtualScrollbarProps {
  containerRef: React.RefObject<HTMLDivElement>;
  width?: number;
  isAutoScrolling?: boolean;
}

export interface VirtualScrollbarRef {
  update: () => void;
}

export const VirtualScrollbar = forwardRef<VirtualScrollbarRef, VirtualScrollbarProps>(({
  containerRef,
  width = 10,
  isAutoScrolling = false
}, ref) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [gutterStyle, setGutterStyle] = useState({
    right: 0,
    top: 0,
    height: 0,
    width
  });

  const dragStartRef = useRef({ y: 0, scrollTop: 0 });
  const rafRef = useRef<number>(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 更新滚动条位置和高度（使用 React state，让 CSS transition 处理平滑过渡）
  const update = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollHeight, clientHeight, scrollTop } = container;
    const containerRect = container.getBoundingClientRect();

    // 如果内容不需要滚动，隐藏滚动条
    if (scrollHeight <= clientHeight) {
      setIsVisible(false);
      setGutterStyle({
        right: window.innerWidth - containerRect.right,
        top: containerRect.top,
        height: clientHeight,
        width
      });
      return;
    }

    // 计算滚动条高度（相对于可见区域的比例）
    const ratio = clientHeight / scrollHeight;
    const newThumbHeight = Math.max(ratio * clientHeight, 20);
    const trackSpace = clientHeight - newThumbHeight;

    // 如果正在自动滚动，固定滚动条在最下面
    let newThumbTop: number;
    if (isAutoScrolling) {
      newThumbTop = trackSpace; // 固定在最下面
    } else {
      // 正常联动：根据 scrollTop 计算位置
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      newThumbTop = scrollRatio * trackSpace;
    }

    setThumbHeight(newThumbHeight);
    setThumbTop(newThumbTop);
    setIsVisible(true);

    // 更新 gutter 位置（fixed 定位）
    setGutterStyle({
      right: window.innerWidth - containerRect.right,
      top: containerRect.top,
      height: clientHeight,
      width
    });
  }, [containerRef, width, isAutoScrolling]);

  // 暴露更新方法给父组件
  useImperativeHandle(ref, () => ({
    update: () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    }
  }), [update]);

  // 监听滚动、大小变化和内容变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);

      // 显示滚动条，空闲后自动隐藏
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        // 如果内容仍然溢出，保持可见
        if (container.scrollHeight > container.clientHeight) return;
        setIsVisible(false);
      }, 1500);
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    resizeObserver.observe(container);

    // 监听内容变化
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(update);
    });
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // 监听窗口滚动和大小变化，更新 fixed 定位
    const handleWindowScroll = () => {
      requestAnimationFrame(update);
    };

    const handleWindowResize = () => {
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('resize', handleWindowResize, { passive: true });

    // 初始更新
    update();

    return () => {
      container.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', handleWindowResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [containerRef, update]);

  // 处理滚动条拖拽
  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    dragStartRef.current = {
      y: e.clientY,
      scrollTop: container.scrollTop
    };
  }, [containerRef]);

  // 拖拽处理
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollHeight, clientHeight } = container;
      const ratio = clientHeight / scrollHeight;
      const thumbH = Math.max(ratio * clientHeight, 20);
      const trackSpace = clientHeight - thumbH;
      const scrollRange = scrollHeight - clientHeight;

      const deltaY = e.clientY - dragStartRef.current.y;
      const scrollDelta = (deltaY / trackSpace) * scrollRange;
      container.scrollTop = dragStartRef.current.scrollTop + scrollDelta;
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, containerRef]);

  // 处理点击轨道区域滚动
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    // 如果点击的是滚动条本身，不处理
    if (barRef.current && (e.target === barRef.current || barRef.current.contains(e.target as Node))) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    const gutter = gutterRef.current;
    if (!container || !gutter) return;

    const trackRect = gutter.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const { scrollHeight, clientHeight } = container;
    const ratio = clickY / clientHeight;
    container.scrollTop = ratio * (scrollHeight - clientHeight);
  }, [containerRef]);

  // 如果内容不需要滚动，隐藏滚动条
  const container = containerRef.current;
  const needsScrollbar = container && container.scrollHeight > container.clientHeight;

  if (!needsScrollbar) {
    return null;
  }

  return (
    <div
      ref={gutterRef}
      className="virtual-scrollbar-gutter"
      style={gutterStyle}
      onClick={handleTrackClick}
    >
      {/* 滚动轨迹背景 */}
      <div className="virtual-scrollbar-track" />
      {/* 滚动条滑块 - 使用 CSS transition 实现平滑过渡 */}
      <div
        ref={barRef}
        className={`virtual-scrollbar-bar ${isDragging ? 'dragging' : ''}`}
        style={{
          height: `${thumbHeight}px`,
          transform: `translateY(${thumbTop}px)`,
          // 拖拽或程序自动滚动时禁用 transition，避免视觉延迟/跳动；
          // 仅在用户手动滚动时启用 transition 以获得平滑过渡
          transition: (isDragging || isAutoScrolling)
            ? 'none'
            : 'height 200ms ease-out, transform 200ms ease-out'
        }}
        onMouseDown={handleThumbMouseDown}
      />
    </div>
  );
});

VirtualScrollbar.displayName = 'VirtualScrollbar';
