import { getShadowRoot } from '@/utils/getShadowRoot';

/** 画布 DOM 写入完成后派发，供选中框 rect / 富文本选区等重算 */
export const EE_CANVAS_MOUNT_EVENT = 'ee-canvas-mount';

export function notifyCanvasMountCommit(): void {
  const shadow = getShadowRoot();
  shadow?.dispatchEvent(
    new CustomEvent(EE_CANVAS_MOUNT_EVENT, { bubbles: true, composed: true }),
  );
}
