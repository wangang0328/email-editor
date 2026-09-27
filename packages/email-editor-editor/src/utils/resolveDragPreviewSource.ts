import { getBlockNodeByIdx } from './getBlockNodeByIdx';

export function resolveDragPreviewSource(
  action: 'add' | 'move',
  idx: string | undefined,
  wrapperEl: HTMLElement | null,
): HTMLElement | null {
  if (action === 'move' && idx) {
    return getBlockNodeByIdx(idx);
  }

  if (!wrapperEl) return null;

  const preview = wrapperEl.querySelector('[data-drag-preview]');
  if (preview instanceof HTMLElement) {
    return preview;
  }

  const firstChild = wrapperEl.firstElementChild;
  return firstChild instanceof HTMLElement ? firstChild : null;
}
