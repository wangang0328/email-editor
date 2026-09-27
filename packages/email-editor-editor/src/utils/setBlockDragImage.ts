import { getShadowRoot } from './getShadowRoot';

export function setBlockDragImage(
  event: DragEvent,
  source: HTMLElement,
  options?: { offsetX?: number; offsetY?: number },
): () => void {
  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;

  clone.style.width = `${Math.max(rect.width, 1)}px`;
  clone.style.height = `${Math.max(rect.height, 1)}px`;
  clone.style.maxWidth = `${Math.max(rect.width, 1)}px`;
  clone.style.boxSizing = 'border-box';
  clone.style.opacity = '0.92';
  clone.style.pointerEvents = 'none';
  clone.style.background = '#fff';
  clone.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
  clone.style.borderRadius = '4px';
  clone.style.overflow = 'hidden';

  const mount = document.createElement('div');
  mount.style.position = 'fixed';
  mount.style.top = '-9999px';
  mount.style.left = '-9999px';
  mount.style.zIndex = '99999';
  mount.style.pointerEvents = 'none';
  mount.appendChild(clone);

  const shadowRoot = getShadowRoot();
  const mountParent =
    shadowRoot && shadowRoot.contains(source) ? shadowRoot : document.body;
  mountParent.appendChild(mount);

  const offsetX = options?.offsetX ?? rect.width / 2;
  const offsetY = options?.offsetY ?? rect.height / 2;

  event.dataTransfer?.setDragImage(clone, offsetX, offsetY);

  return () => {
    mount.remove();
  };
}
