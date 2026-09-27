import React, { useLayoutEffect, useRef } from 'react';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import './overlayScrollbar.css';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { cn } from '../../lib/utils';

/**
 * 侧栏滚动容器（OverlayScrollbars）。
 * flex 列布局用 flex-1 + min-h-0，勿用 height:100% 撑高；glue 占位见 overlayScrollbar.css。
 */
export const FullHeightOverlayScrollbars: React.FC<{
  children: React.ReactNode | React.ReactElement;
  height: string | number;
}> = (props) => {
  const osRef = useRef<OverlayScrollbarsComponent | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const isFill = props.height === '100%';

  useLayoutEffect(() => {
    let raf = 0;
    const update = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inst = (osRef.current as any)?.osInstance?.();
      inst?.update?.();
    };

    raf = requestAnimationFrame(update);

    const el = hostRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });
    ro.observe(el);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [props.height]);

  return (
    <div
      ref={hostRef}
      className={cn(
        'ee-panel-scroll-host',
        isFill && 'ee-panel-scroll-host--fill',
      )}
      style={
        isFill
          ? { minHeight: 0, overflow: 'hidden' }
          : { height: props.height, minHeight: 0, maxHeight: props.height, overflow: 'hidden' }
      }
    >
      <OverlayScrollbarsComponent
        ref={osRef}
        className="ee-panel-scroll h-full w-full"
        options={{ scrollbars: { autoHide: 'leave', autoHideDelay: 0 } }}
        style={{ height: '100%', maxHeight: '100%' }}
      >
        {props.children}
      </OverlayScrollbarsComponent>
    </div>
  );
};
