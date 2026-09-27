import { findElementByStableIdInRoot } from './findElementByStableId';

/**
 * 纯 DOM 搬移 segment 顺序（零编译、零 postProcess）。
 * 要求所有 segment 为同一父节点的直接子节点。
 *
 * 从后往前 insertBefore，避免前向循环在「首段后移」时顺序错乱。
 */
export function reorderSegmentDom(
  container: HTMLElement,
  targetOrder: string[],
): boolean {
  if (targetOrder.length === 0) {
    return true;
  }

  const elements: Element[] = [];

  for (const stableId of targetOrder) {
    const el = findElementByStableIdInRoot(container, stableId, true);
    if (!el) {
      return false;
    }
    elements.push(el);
  }

  const parent = elements[0].parentElement;
  if (!parent) {
    return false;
  }

  if (!elements.every((el) => el.parentElement === parent)) {
    return false;
  }

  for (let i = targetOrder.length - 1; i >= 0; i -= 1) {
    const el = elements[i];
    const after = i + 1 < elements.length ? elements[i + 1] : null;
    if (el.nextElementSibling !== after) {
      parent.insertBefore(el, after);
    }
  }

  return true;
}
