/** 编辑器 UI 稳定类名（替代原 Arco DOM 类，供 SCSS / 脚本选择器使用） */
export const EDITOR_CLASS = {
  layout: 'ee-layout',
  layoutSiderContent: 'ee-layout-sider-content',
  tabsContent: 'ee-tabs-content',
  tabsHeader: 'ee-tabs-header',
  tabsHeaderNav: 'ee-tabs-header-nav',
  collapseItem: 'ee-collapse-item',
  collapseItemHeader: 'ee-collapse-item-header',
  popoverContent: 'ee-popover-content',
  popoverContentInner: 'ee-popover-content-inner',
  selectTrigger: 'ee-select-trigger',
  selectValue: 'ee-select-value',
  inputGroup: 'ee-input-group',
  inputWithAddon: 'ee-input-with-addon',
  inputGroupAddon: 'ee-input-group-addon',
  btnDefault: 'ee-btn-default',
  treeNodeTitle: 'ee-tree-node-title',
  treeNodeSelected: 'ee-tree-node-selected',
  treeNodeExpanded: 'ee-tree-node-expanded',
  treeNodeIndent: 'ee-tree-node-indent',
  treeNodeDragIcon: 'ee-tree-node-drag-icon',
  treeDropGapTop: 'ee-tree-drop-gap-top',
  treeDropGapBottom: 'ee-tree-drop-gap-bottom',
  treeDropHighlight: 'ee-tree-drop-highlight',
} as const

export const TREE_DROP_GAP_CLASSES = [
  EDITOR_CLASS.treeDropGapTop,
  EDITOR_CLASS.treeDropGapBottom,
  EDITOR_CLASS.treeDropHighlight,
] as const

export const TREE_DROP_GAP_SELECTOR = TREE_DROP_GAP_CLASSES.map((c) => `.${c}`).join(', ')
