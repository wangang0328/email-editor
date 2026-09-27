import { EMAIL_BLOCK_CLASS_NAME } from '@wa-dev/email-editor-blocks-react';
import {
  ContentEditableType,
  DATA_CONTENT_EDITABLE_TYPE,
  getShadowRoot,
  getShadowSelection,
} from '@wa-dev/email-editor-editor';
import {
  getFontSizePxFromLegacySize,
  normalizeFontSizePx,
  resolveFontSizePx,
} from '../shared/fontSizeOptions';

export type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough';

const FORMAT_TAGS: Record<FormatCommand, string[]> = {
  bold: ['b', 'strong'],
  italic: ['i', 'em'],
  underline: ['u'],
  strikeThrough: ['strike', 's', 'del'],
};

function isFormatStyleActive(element: Element, command: FormatCommand): boolean {
  const style = window.getComputedStyle(element);
  switch (command) {
    case 'bold': {
      const fw = style.fontWeight;
      return fw === 'bold' || (parseInt(fw, 10) || 0) >= 600;
    }
    case 'italic':
      return style.fontStyle === 'italic';
    case 'underline':
      return style.textDecorationLine.includes('underline');
    case 'strikeThrough':
      return style.textDecorationLine.includes('line-through');
    default:
      return false;
  }
}

function findRichTextEditableInNode(
  node: Node | null | undefined,
  focusBlockNode: HTMLElement | null | undefined,
): HTMLElement | null {
  let current: Node | null | undefined = node;
  if (current?.nodeType === Node.TEXT_NODE) {
    current = current.parentNode;
  }

  while (current) {
    if (
      current instanceof HTMLElement &&
      current.getAttribute('contenteditable') === 'true' &&
      current.getAttribute(DATA_CONTENT_EDITABLE_TYPE) === ContentEditableType.RichText &&
      (!focusBlockNode || focusBlockNode.contains(current))
    ) {
      return current;
    }
    if (current === focusBlockNode) {
      break;
    }
    current = current.parentNode;
  }

  return null;
}

function listRichTextEditables(focusBlockNode: HTMLElement): HTMLElement[] {
  return Array.from(
    focusBlockNode.querySelectorAll<HTMLElement>(
      `[contenteditable="true"][${DATA_CONTENT_EDITABLE_TYPE}="${ContentEditableType.RichText}"]`,
    ),
  );
}

export function getRichTextContentEditable(
  focusBlockNode: HTMLElement | null | undefined,
): HTMLElement | null {
  const active = getShadowRoot()?.activeElement;
  if (
    active instanceof HTMLElement &&
    active.getAttribute('contenteditable') === 'true' &&
    active.getAttribute(DATA_CONTENT_EDITABLE_TYPE) === ContentEditableType.RichText &&
    (!focusBlockNode || focusBlockNode.contains(active))
  ) {
    return active;
  }

  const selection = getShadowSelection();
  if (selection && selection.rangeCount > 0) {
    const fromSelection = findRichTextEditableInNode(
      selection.getRangeAt(0).commonAncestorContainer,
      focusBlockNode,
    );
    if (fromSelection) {
      return fromSelection;
    }
  }

  if (focusBlockNode) {
    const editables = listRichTextEditables(focusBlockNode);
    if (editables.length === 1) {
      return editables[0];
    }
    if (editables.length > 1) {
      return null;
    }
  }

  if (active instanceof HTMLElement && active.getAttribute('contenteditable') === 'true') {
    return active;
  }

  return null;
}

export function createSelectAllRange(element: HTMLElement): Range {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range;
}

export function resolveExecRange(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null | undefined,
): { range: Range; contentEditable: HTMLElement } | null {
  const fromStoredRange = selectionRange
    ? findRichTextEditableInNode(
        selectionRange.commonAncestorContainer,
        focusBlockNode,
      )
    : null;

  const contentEditable =
    fromStoredRange ?? getRichTextContentEditable(focusBlockNode);
  if (!contentEditable) return null;

  const hasValidSelection =
    selectionRange &&
    !selectionRange.collapsed &&
    contentEditable.contains(selectionRange.commonAncestorContainer);

  // 有非空选区：只操作选中内容；无选区 / 折叠光标：默认操作当前富文本全部内容
  if (hasValidSelection) {
    return { range: selectionRange, contentEditable };
  }

  return { range: createSelectAllRange(contentEditable), contentEditable };
}

export function isFormatActiveAtNode(
  node: Node | null | undefined,
  command: FormatCommand,
): boolean {
  let current: Node | null | undefined = node;
  const tags = FORMAT_TAGS[command];

  while (current) {
    if (current instanceof Element) {
      if (current.classList.contains(EMAIL_BLOCK_CLASS_NAME)) return false;
      const tag = current.tagName.toLowerCase();
      if (tags.includes(tag) || isFormatStyleActive(current, command)) {
        return true;
      }
    }
    current = current.parentNode;
  }

  return false;
}

function isFormatActiveForAllText(
  element: HTMLElement,
  command: FormatCommand,
): boolean {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let hasText = false;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    hasText = true;
    if (!isFormatActiveAtNode(node, command)) return false;
  }

  return hasText || isFormatActiveAtNode(element, command);
}

export function getFormatState(
  command: FormatCommand,
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null,
): boolean {
  const resolved = resolveExecRange(selectionRange, focusBlockNode);
  if (!resolved) return false;

  const { contentEditable } = resolved;

  const applyToAll =
    !selectionRange ||
    selectionRange.collapsed ||
    !contentEditable.contains(selectionRange.commonAncestorContainer);

  // 与 execCommand 一致：无选区时按整段富文本判断高亮
  if (applyToAll) {
    return isFormatActiveForAllText(contentEditable, command);
  }

  return isFormatActiveAtNode(selectionRange.startContainer, command);
}

export type TextAlignValue = 'left' | 'center' | 'right' | 'justify';

function normalizeTextAlign(align: string): TextAlignValue | null {
  if (align === 'center') return 'center';
  if (align === 'right' || align === 'end') return 'right';
  if (align === 'justify') return 'justify';
  if (align === 'left' || align === 'start') return 'left';
  return null;
}

export function getTextAlignAtNode(
  node: Node | null | undefined,
): TextAlignValue {
  let current: Node | null | undefined = node;

  while (current) {
    if (current instanceof Element) {
      if (current.classList.contains(EMAIL_BLOCK_CLASS_NAME)) {
        break;
      }
      const align = normalizeTextAlign(window.getComputedStyle(current).textAlign);
      if (align) {
        return align;
      }
    }
    current = current.parentNode;
  }

  return 'left';
}

export function getTextAlignState(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null,
): TextAlignValue {
  const resolved = resolveExecRange(selectionRange, focusBlockNode);
  if (!resolved) return 'left';

  const { contentEditable } = resolved;

  if (!selectionRange) {
    return getTextAlignAtNode(contentEditable);
  }

  return getTextAlignAtNode(selectionRange.startContainer);
}

export function getStyleTargetElement(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null,
): HTMLElement | null {
  const resolved = resolveExecRange(selectionRange, focusBlockNode);
  if (!resolved) return null;

  const { range, contentEditable } = resolved;
  const node = range.commonAncestorContainer;

  if (node instanceof HTMLElement) return node;
  if (node.parentElement instanceof HTMLElement) return node.parentElement;

  return contentEditable;
}

export function hasValidUserSelection(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null | undefined,
): boolean {
  return !!(
    selectionRange &&
    !selectionRange.collapsed &&
    focusBlockNode?.contains(selectionRange.commonAncestorContainer)
  );
}

function parseFontFamilyValue(computed: string): string {
  return (computed || '').split(',')[0].replace(/['"]/g, '').trim();
}

function getExplicitFontFamilyAtNode(
  node: Node | null | undefined,
  contentEditable: HTMLElement,
): string {
  let current: Node | null | undefined = node;

  while (current && current !== contentEditable) {
    if (current instanceof HTMLElement) {
      if (current.classList.contains(EMAIL_BLOCK_CLASS_NAME)) {
        break;
      }
      if (current.style.fontFamily) {
        return parseFontFamilyValue(current.style.fontFamily);
      }
      const tag = current.tagName.toLowerCase();
      if (tag === 'font') {
        const face = current.getAttribute('face');
        if (face) return face.trim();
      }
    }
    current = current.parentNode;
  }

  return parseFontFamilyValue(window.getComputedStyle(contentEditable).fontFamily);
}

function getFontFamilyForAllText(element: HTMLElement): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let uniformFont = '';
  let hasText = false;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    hasText = true;
    const font = getExplicitFontFamilyAtNode(node, element);
    if (!uniformFont) {
      uniformFont = font;
    } else if (font.toLowerCase() !== uniformFont.toLowerCase()) {
      return getExplicitFontFamilyAtNode(element.firstChild, element);
    }
  }

  if (hasText) return uniformFont;

  return getExplicitFontFamilyAtNode(element, element);
}

export function getFontFamilyState(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null,
): string {
  const contentEditable = getRichTextContentEditable(focusBlockNode);
  if (!contentEditable) return '';

  if (!selectionRange) {
    return getFontFamilyForAllText(contentEditable);
  }

  if (selectionRange.collapsed) {
    return getExplicitFontFamilyAtNode(selectionRange.startContainer, contentEditable);
  }

  return getExplicitFontFamilyAtNode(selectionRange.startContainer, contentEditable);
}

function escapeFontFamilyForStyle(fontFamily: string): string {
  if (/[",]/.test(fontFamily)) {
    return `"${fontFamily.replace(/"/g, '\\"')}"`;
  }
  return fontFamily;
}

export function applyFontFamilyToRange(
  range: Range,
  contentEditable: HTMLElement,
  fontFamily: string,
): void {
  if (!contentEditable.textContent?.trim()) {
    return;
  }

  const span = document.createElement('span');
  span.style.fontFamily = fontFamily;

  try {
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);

    const selection = getShadowSelection();
    if (selection) {
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }
  } catch {
    const escaped = escapeFontFamilyForStyle(fontFamily);
    contentEditable.innerHTML = `<span style="font-family: ${escaped}">${contentEditable.innerHTML}</span>`;
  }
}

function getExplicitFontSizeAtNode(
  node: Node | null | undefined,
  contentEditable: HTMLElement,
): string {
  let current: Node | null | undefined = node;

  while (current && current !== contentEditable) {
    if (current instanceof HTMLElement) {
      if (current.classList.contains(EMAIL_BLOCK_CLASS_NAME)) {
        break;
      }
      if (current.style.fontSize) {
        return normalizeFontSizePx(current.style.fontSize);
      }
      const tag = current.tagName.toLowerCase();
      if (tag === 'font') {
        const legacyPx = getFontSizePxFromLegacySize(current.getAttribute('size'));
        if (legacyPx) return legacyPx;
      }
    }
    current = current.parentNode;
  }

  return normalizeFontSizePx(window.getComputedStyle(contentEditable).fontSize);
}

function getFontSizeForAllText(element: HTMLElement): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let uniformSize = '';
  let hasText = false;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    hasText = true;
    const size = getExplicitFontSizeAtNode(node, element);
    if (!uniformSize) {
      uniformSize = size;
    } else if (size !== uniformSize) {
      return getExplicitFontSizeAtNode(element.firstChild, element);
    }
  }

  if (hasText) return uniformSize;

  return getExplicitFontSizeAtNode(element, element);
}

export function getFontSizeState(
  selectionRange: Range | null,
  focusBlockNode: HTMLElement | null,
): string {
  const contentEditable = getRichTextContentEditable(focusBlockNode);
  if (!contentEditable) return '';

  if (!selectionRange) {
    return getFontSizeForAllText(contentEditable);
  }

  if (selectionRange.collapsed) {
    return getExplicitFontSizeAtNode(selectionRange.startContainer, contentEditable);
  }

  return getExplicitFontSizeAtNode(selectionRange.startContainer, contentEditable);
}

export function applyFontSizeToRange(
  range: Range,
  contentEditable: HTMLElement,
  sizeValue: string,
): void {
  if (!contentEditable.textContent?.trim()) {
    return;
  }

  const fontSize = resolveFontSizePx(sizeValue);
  const span = document.createElement('span');
  span.style.fontSize = fontSize;

  try {
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);

    const selection = getShadowSelection();
    if (selection) {
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }
  } catch {
    contentEditable.innerHTML = `<span style="font-size: ${fontSize}">${contentEditable.innerHTML}</span>`;
  }
}
