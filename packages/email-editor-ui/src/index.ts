export { cn } from './lib/utils';
export {
  EDITOR_CLASS,
  TREE_DROP_GAP_CLASSES,
  TREE_DROP_GAP_SELECTOR,
} from './styles/editorClassNames';
/**
 * 样式由 lib/style.css 统一导出；preset/lib/style.css 会再聚合 ui + panels。
 * 宿主一般只需引 preset（+ editor）的 style.css，不必单独引本包。
 */
import './styles/input-number.css';
export * from './components/ui-adapter';
export { FullHeightOverlayScrollbars } from './components/FullHeightOverlayScrollbars';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export { isPanelDebugEnabled, panelDebug, panelDebugHintOnce } from './utils/panelDebug';
