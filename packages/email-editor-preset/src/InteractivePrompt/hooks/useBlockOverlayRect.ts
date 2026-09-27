import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  EE_CANVAS_MOUNT_EVENT,
  getPluginElement,
  getShadowRoot,
  SYNC_SCROLL_ELEMENT_CLASS_NAME,
} from '@wa-dev/email-editor-editor';

export type BlockOverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function computeBlockOverlayRect(blockNode: HTMLElement): BlockOverlayRect | null {
  const overlayRoot = getPluginElement();
  if (!overlayRoot || !blockNode.isConnected) {
    return null;
  }

  const blockBounds = blockNode.getBoundingClientRect();
  const overlayBounds = overlayRoot.getBoundingClientRect();

  return {
    top: blockBounds.top - overlayBounds.top,
    left: blockBounds.left - overlayBounds.left,
    width: blockBounds.width,
    height: blockBounds.height,
  };
}

function applyBlockOverlayRect(el: HTMLElement, rect: BlockOverlayRect): void {
  el.style.top = `${rect.top}px`;
  el.style.left = `${rect.left}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

export type UseBlockOverlayRectResult = {
  rect: BlockOverlayRect | null;
  overlayRef: (el: HTMLDivElement | null) => void;
};

/**
 * 将块 DOM 的屏幕坐标换算为 #easy-email-plugins 内的绝对定位矩形。
 * 滚动时直接写 DOM，避免 rAF + setState 造成聚焦框滞后 1–2 帧。
 */
export function useBlockOverlayRect(
  blockNode: HTMLElement | null,
  refreshKey: string,
): UseBlockOverlayRectResult {
  const [rect, setRect] = useState<BlockOverlayRect | null>(null);
  const overlayElRef = useRef<HTMLDivElement | null>(null);
  const blockNodeRef = useRef(blockNode);
  blockNodeRef.current = blockNode;

  const measure = useCallback(() => {
    const node = blockNodeRef.current;
    if (!node) {
      setRect(null);
      return;
    }

    const next = computeBlockOverlayRect(node);
    setRect(next);
    if (next && overlayElRef.current) {
      applyBlockOverlayRect(overlayElRef.current, next);
    }
  }, []);

  const measureOnScroll = useCallback(() => {
    const node = blockNodeRef.current;
    const el = overlayElRef.current;
    if (!node || !el) {
      return;
    }

    const next = computeBlockOverlayRect(node);
    if (next) {
      applyBlockOverlayRect(el, next);
    }
  }, []);

  const overlayRef = useCallback(
    (el: HTMLDivElement | null) => {
      overlayElRef.current = el;
      if (!el) {
        return;
      }

      const node = blockNodeRef.current;
      if (!node) {
        return;
      }

      const next = computeBlockOverlayRect(node);
      if (next) {
        applyBlockOverlayRect(el, next);
        setRect(next);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    measure();

    const shadow = getShadowRoot();
    const scrollEl = shadow?.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`);
    const overlayRoot = getPluginElement();

    scrollEl?.addEventListener('scroll', measureOnScroll, { passive: true });
    shadow?.addEventListener('scroll', measureOnScroll, { capture: true, passive: true });
    window.addEventListener('resize', measure, { passive: true });
    shadow?.addEventListener(EE_CANVAS_MOUNT_EVENT, measure);

    let resizeObserver: ResizeObserver | undefined;
    const node = blockNodeRef.current;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      if (node) {
        resizeObserver.observe(node);
      }
      // 侧栏开合会改变画布布局，需观察 overlay 根与文档根
      if (overlayRoot) {
        resizeObserver.observe(overlayRoot);
      }
      if (document.documentElement) {
        resizeObserver.observe(document.documentElement);
      }
      const canvasHost = shadow?.host instanceof Element ? shadow.host : null;
      if (canvasHost) {
        resizeObserver.observe(canvasHost);
      }
    }

    let mountRetry = 0;
    if (!node) {
      mountRetry = requestAnimationFrame(measure);
    }

    return () => {
      if (mountRetry) {
        cancelAnimationFrame(mountRetry);
      }
      scrollEl?.removeEventListener('scroll', measureOnScroll);
      shadow?.removeEventListener('scroll', measureOnScroll, { capture: true });
      window.removeEventListener('resize', measure);
      shadow?.removeEventListener(EE_CANVAS_MOUNT_EVENT, measure);
      resizeObserver?.disconnect();
    };
  }, [blockNode, measure, measureOnScroll, refreshKey]);

  return { rect, overlayRef };
}
