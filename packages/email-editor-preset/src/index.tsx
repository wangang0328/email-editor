/**
 * 样式统一打进 lib/style.css：ui（含 overlayscrollbars）+ panels + chrome + 本包 scss。
 * 宿主只需 import '@wa-dev/email-editor-preset/style.css'（另加 editor 的 style.css）。
 */
import '../../email-editor-ui/lib/style.css';
import '../../email-editor-panels/lib/style.css';
import './styles/chrome.css';
import './index.scss';

export * from './BlockLayer';
export * from './AttributePanel';
export * from './ShortcutToolbar';
export * from './SourceCodePanel';
export * from './InteractivePrompt';
export * from './SimpleLayout';
export * from './StandardLayout';
export * from './MergeTagBadgePrompt';
export * from './components/Providers/ExtensionProvider';
export * from './constants';
export * from '@wa-dev/email-editor-panels';
export { ShadowDom } from '@wa-dev/email-editor-panels';
export {
  Collapse,
  Grid,
  Space,
  Popover,
  Button,
  Switch,
  Tooltip,
  type FormItemProps,
} from '@wa-dev/email-editor-ui';
export {
  getBlockTypeIcon,
  setBlockTypeIcons,
  getIconNameByBlockType,
  setIconsMap,
} from './utils/getBlockTypeIcon';
export { getBlockTitle } from './utils/getBlockTitle';
export { MjmlToJson } from './utils/MjmlToJson';
