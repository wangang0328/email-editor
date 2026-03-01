// src/hooks/useScrollSync.ts
import { useEffect, useRef, useCallback } from 'react';

export const useScrollSync = (
  messagesCount: number,
  onActiveChange: (index: number) => void,
  options: ScrollSyncOptions = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageRefs = useRef<(HTMLElement | null)[]>([]);

  const {
    threshold = 0.5,
    rootMargin = '-40% 0px -40% 0px',
    activeClass = 'message-active'
  } = options;

  // 初始化Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            onActiveChange(index);

            // 添加激活类名
            entry.target.classList.add(activeClass);
          } else {
            entry.target.classList.remove(activeClass);
          }
        });
      },
      {
        threshold,
        rootMargin,
        root: null,
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onActiveChange, threshold, rootMargin, activeClass]);

  // 注册消息元素
  const registerMessageRef = useCallback((index: number, element: HTMLElement | null) => {
    messageRefs.current[index] = element;

    if (element && observerRef.current) {
      element.setAttribute('data-index', index.toString());
      observerRef.current.observe(element);
    }
  }, []);

  // 滚动到指定消息
  const scrollToMessage = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const element = messageRefs.current[index];
    if (element) {
      // 使用scrollIntoView
      element.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'nearest',
      });

      // 添加高亮效果
      element.classList.add('highlight-scroll');
      setTimeout(() => {
        element.classList.remove('highlight-scroll');
      }, 1500);

      // 触发回调
      onActiveChange(index);
    }
  }, [onActiveChange]);

  // 清除所有观察
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    messageRefs.current = [];
  }, []);

  return {
    registerMessageRef,
    scrollToMessage,
    cleanup,
    messageRefs,
  };
};