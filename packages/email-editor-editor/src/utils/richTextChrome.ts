import { FIXED_CONTAINER_ID, RICH_TEXT_BAR_ID } from '@/constants';
import { getEditorRoot } from './getEditorRoot';
import { getShadowRoot } from './getShadowRoot';

const TOOLBAR_DROPDOWN_SELECTOR = '.email-editor-toolbar-dropdown';
const SIDEBAR_SELECTOR = '[data-email-editor-sidebar]';

/**
 * 画布 pointerdown 选中其他块时，短暂抑制 L3 冻结。
 * 否则 activeElement 仍为旧 contenteditable，shouldPreserveInlineTextDom 误判为「仍在打字」。
 */
let inlineTextPreserveSuppressedUntil = 0;

export function suppressInlineTextPreserve(durationMs = 200): void {
  inlineTextPreserveSuppressedUntil = performance.now() + durationMs;
}

/** 增删移复制前退出内联富文本，避免 L3 冻结导致画布不刷新 */
export function exitInlineTextEditingForStructureMutation(): void {
  suppressInlineTextPreserve();
  const active = getShadowRoot()?.activeElement;
  if (
    active instanceof HTMLElement &&
    active.getAttribute('contenteditable') === 'true'
  ) {
    active.blur();
  }
}

export function isRichTextToolbarVisible(): boolean {
  const bar = getShadowRoot()?.getElementById(RICH_TEXT_BAR_ID);
  if (!bar) {
    return false;
  }
  return bar.style.visibility === 'visible';
}

/** 焦点是否在侧栏属性面板（改 padding/颜色时不应冻结画布） */
export function isSidebarFocused(): boolean {
  const active = document.activeElement;
  return active instanceof Element && Boolean(active.closest(SIDEBAR_SELECTOR));
}

/**
 * 内联富文本编辑中：不应重绘 MJML DOM，避免选区被销毁。
 * 焦点判定以 shadowRoot.activeElement 为准（contenteditable）；
 * document.activeElement 在 Shadow DOM 下通常是 host，不能当成「未在编辑」。
 * 侧栏 / 固定弹层获焦时不冻结，避免属性改动被 L3 跳过。
 */
export function shouldPreserveInlineTextDom(): boolean {
  if (performance.now() < inlineTextPreserveSuppressedUntil) {
    return false;
  }

  if (isSidebarFocused()) {
    return false;
  }

  const docActive = document.activeElement;
  if (docActive instanceof Element) {
    if (docActive.closest(SIDEBAR_SELECTOR)) {
      return false;
    }
    if (docActive.closest(`#${FIXED_CONTAINER_ID}`)) {
      return false;
    }
  }

  const shadowRoot = getShadowRoot();
  const shadowActive = shadowRoot?.activeElement;
  if (
    !(shadowActive instanceof HTMLElement) ||
    shadowActive.getAttribute('contenteditable') !== 'true'
  ) {
    return false;
  }

  // open shadow：深度焦点在 contenteditable 时，document.activeElement 多为 host
  if (docActive === shadowActive || docActive === shadowRoot?.host) {
    return true;
  }

  return docActive instanceof Node && Boolean(shadowRoot?.contains(docActive));
}

/** 点击是否落在工具栏/弹层（不含普通文本编辑区） */
export function isRichTextToolbarInteraction(event: Event): boolean {
  const path = event.composedPath?.() ?? [];

  const fixedContainer = document.getElementById(FIXED_CONTAINER_ID);
  if (
    fixedContainer &&
    path.some((node) => node instanceof Node && fixedContainer.contains(node))
  ) {
    return true;
  }

  const shadowRoot = getShadowRoot();
  const richTextBar =
    shadowRoot?.getElementById(RICH_TEXT_BAR_ID) ??
    shadowRoot?.querySelector(`#${RICH_TEXT_BAR_ID}`);
  if (
    richTextBar &&
    path.some((node) => node instanceof Node && richTextBar.contains(node))
  ) {
    return true;
  }

  return path.some(
    (node) =>
      node instanceof Element &&
      Boolean(node.closest(TOOLBAR_DROPDOWN_SELECTOR)),
  );
}

/** 点击是否在编辑器内（含 shadow DOM 中的画布） */
export function isInsideEditor(event: Event): boolean {
  const editorRoot = getEditorRoot();
  if (!editorRoot) {
    return false;
  }

  const path = event.composedPath?.() ?? [];
  return path.includes(editorRoot);
}

/** 窗口级外部点击判断：编辑器内普通点击不算外部 */
export function isRichTextChromeInteraction(event: Event): boolean {
  if (isRichTextToolbarInteraction(event)) {
    return true;
  }
  return isInsideEditor(event);
}
