import { BlockIndexRegistry } from '@wa-dev/email-editor-shared';

let currentRegistry: BlockIndexRegistry | null = null;

export function setBlockIndexRegistry(registry: BlockIndexRegistry | null): void {
  currentRegistry = registry;
}

export function getBlockIndexRegistry(): BlockIndexRegistry | null {
  return currentRegistry;
}

export function uidToIdx(uid: string): string | null {
  return currentRegistry?.uidToIdx(uid) ?? null;
}

export function idxToUid(idx: string): string | null {
  return currentRegistry?.idxToUid(idx) ?? null;
}

export function resolveIdxFromElement(element: Element | null): string | null {
  if (!element) {
    return null;
  }

  const uid = getBlockUidFromElement(element);
  if (uid) {
    const idx = uidToIdx(uid);
    if (idx) {
      return idx;
    }
  }

  return null;
}

export function getBlockUidFromElement(element: Element | null): string | null {
  if (!element) {
    return null;
  }

  const withUid = element.closest('[data-ee-uid]');
  if (withUid instanceof Element) {
    const uid = withUid.getAttribute('data-ee-uid');
    if (uid) {
      return uid;
    }
  }

  return null;
}
