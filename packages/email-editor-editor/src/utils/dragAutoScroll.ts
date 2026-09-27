/** 拖拽时靠近滚动容器上下边缘的自动滚动强度（px / frame） */

export type DragAutoScrollRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function computeDragAutoScrollDelta(
  clientX: number,
  clientY: number,
  rect: DragAutoScrollRect,
  options?: { edgePx?: number; maxSpeed?: number; horizontalMargin?: number },
): number {
  const edgePx = options?.edgePx ?? 56;
  const maxSpeed = options?.maxSpeed ?? 18;
  const horizontalMargin = options?.horizontalMargin ?? 24;

  // 指针明显偏到侧栏 / 画布外时不滚，避免误触
  if (
    clientX < rect.left - horizontalMargin ||
    clientX > rect.right + horizontalMargin
  ) {
    return 0;
  }

  if (clientY < rect.top + edgePx) {
    const intensity = Math.min(1, (rect.top + edgePx - clientY) / edgePx);
    return -Math.max(1, Math.ceil(maxSpeed * intensity));
  }

  if (clientY > rect.bottom - edgePx) {
    const intensity = Math.min(1, (clientY - (rect.bottom - edgePx)) / edgePx);
    return Math.max(1, Math.ceil(maxSpeed * intensity));
  }

  return 0;
}

/**
 * 在 HTML5 dragover 期间驱动滚动容器自动滚动。
 * dragover 在指针静止时不一定连续触发，因此用 rAF 维持滚动直到离开边缘。
 */
export function createDragAutoScroller(
  getScrollElement: () => HTMLElement | null,
) {
  let rafId = 0;
  let velocity = 0;

  const tick = () => {
    const el = getScrollElement();
    if (!el || velocity === 0) {
      rafId = 0;
      return;
    }

    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      velocity = 0;
      rafId = 0;
      return;
    }

    const next = Math.min(maxScroll, Math.max(0, el.scrollTop + velocity));
    if (next === el.scrollTop) {
      // 已顶/底，停住，避免空转
      velocity = 0;
      rafId = 0;
      return;
    }

    el.scrollTop = next;
    rafId = requestAnimationFrame(tick);
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    const el = getScrollElement();
    if (!el) {
      stop();
      return;
    }

    velocity = computeDragAutoScrollDelta(
      clientX,
      clientY,
      el.getBoundingClientRect(),
    );

    if (velocity !== 0 && rafId === 0) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    velocity = 0;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  return {
    updateFromPointer,
    stop,
  };
}
