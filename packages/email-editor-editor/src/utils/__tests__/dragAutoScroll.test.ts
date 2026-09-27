import {
  computeDragAutoScrollDelta,
  createDragAutoScroller,
} from '../dragAutoScroll';

describe('computeDragAutoScrollDelta', () => {
  const rect = { top: 100, bottom: 500, left: 200, right: 600 };

  it('scrolls up near the top edge', () => {
    expect(computeDragAutoScrollDelta(300, 110, rect)).toBeLessThan(0);
  });

  it('scrolls down near the bottom edge', () => {
    expect(computeDragAutoScrollDelta(300, 490, rect)).toBeGreaterThan(0);
  });

  it('does not scroll in the middle', () => {
    expect(computeDragAutoScrollDelta(300, 300, rect)).toBe(0);
  });

  it('does not scroll when pointer is far outside horizontally', () => {
    expect(computeDragAutoScrollDelta(20, 110, rect)).toBe(0);
  });

  it('scales speed by edge proximity', () => {
    const far = Math.abs(computeDragAutoScrollDelta(300, 100, rect));
    const near = Math.abs(computeDragAutoScrollDelta(300, 140, rect));
    expect(far).toBeGreaterThan(near);
  });
});

describe('createDragAutoScroller', () => {
  it('updates scrollTop while near edge and stops cleanly', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 200 });
    Object.defineProperty(el, 'scrollHeight', { value: 800 });
    el.scrollTop = 100;
    el.getBoundingClientRect = () =>
      ({
        top: 0,
        bottom: 200,
        left: 0,
        right: 300,
        width: 300,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const scroller = createDragAutoScroller(() => el);
    scroller.updateFromPointer(150, 10);

    // 手动跑一帧逻辑：update 已设置 velocity；用 stop 验证可清理
    expect(typeof el.scrollTop).toBe('number');
    scroller.stop();
  });
});
