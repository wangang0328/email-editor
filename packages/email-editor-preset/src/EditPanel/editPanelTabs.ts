import type { CSSProperties } from 'react';

/** 左侧编辑栏 / 配置抽屉 / 画布顶栏共用高度 */
export const EDIT_PANEL_TAB_BAR_HEIGHT_PX = 48;

export const editPanelSiderClass =
  'ee-edit-panel-sider flex h-full min-h-0 min-w-[360px] max-w-[360px] shrink-0 flex-col overflow-hidden border-r border-[var(--ee-panel-border,rgba(15,23,42,0.06))] bg-[var(--ee-panel-bg,#fafafa)] pr-0';

export const editPanelTabsRootClass =
  'edit-panel-tabs flex h-full min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-[var(--ee-panel-bg,#fafafa)] p-0';

export const editPanelTabsHeaderWrapClass =
  'edit-panel-tabs-header min-w-0 flex-1 max-w-full overflow-hidden';

export const editPanelTabsHeaderRowClass =
  'edit-panel-tabs-header-row flex h-12 shrink-0 min-w-0 max-w-full items-center overflow-hidden';

export const editPanelTabBackButtonClass =
  'shrink-0 cursor-pointer rounded-lg border border-transparent p-2 text-[var(--color-text-2,#4e5969)] transition-colors hover:bg-white/70 hover:text-[var(--color-text-1,#1d2129)]';

export const editPanelTabBarFlexClass = 'min-w-0 flex-1';

/** 盖住整块侧栏（含 Tab 栏）；z-index 需高于底层 Scrollbars/树节点等 */
export const editPanelOverlayClass =
  'pointer-events-auto absolute inset-0 z-[200] flex h-full w-full min-h-0 flex-col bg-[var(--ee-panel-bg,#fafafa)]';

/** 覆盖层内可滚动区域（属性表单） */
export const editPanelOverlayScrollClass =
  'ee-panel-scroll min-h-0 flex-1 basis-0 overflow-x-hidden overflow-y-auto';

export const editPanelOverlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  backgroundColor: 'var(--ee-panel-bg, #fafafa)',
};

/** calc(编辑器高度 - 标签栏高度) */
export function editPanelTabContentHeight(editorHeight: string) {
  return `calc(${editorHeight} - ${EDIT_PANEL_TAB_BAR_HEIGHT_PX}px)`;
}
