import {
  isRichTextChromeInteraction as baseChromeInteraction,
  isRichTextToolbarInteraction as baseToolbarInteraction,
  isRichTextToolbarVisible,
} from '@wa-dev/email-editor-editor';

let toolbarInteractionLock = 0;

export function lockRichTextToolbar() {
  toolbarInteractionLock += 1;
}

export function unlockRichTextToolbar() {
  toolbarInteractionLock = Math.max(0, toolbarInteractionLock - 1);
}

export function isRichTextToolbarLocked() {
  return toolbarInteractionLock > 0;
}

export function isRichTextToolbarInteraction(event: Event): boolean {
  if (isRichTextToolbarLocked()) {
    return true;
  }
  return baseToolbarInteraction(event);
}

export function isRichTextChromeInteraction(event: Event): boolean {
  if (isRichTextToolbarLocked()) {
    return true;
  }
  return baseChromeInteraction(event);
}

export { isRichTextToolbarVisible };
