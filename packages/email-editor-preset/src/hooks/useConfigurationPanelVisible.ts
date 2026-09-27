import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { getPageIdx } from '@wa-dev/email-editor-blocks-react';

/**
 * 非 page 块选中时始终显示配置；page 在用户主动选中后显示（初始 focusIdx=page 不自动弹出）。
 */
export function useConfigurationPanelVisible() {
  const { focusIdx, configPanelOpen, dismissConfigPanel } = useFocusIdx();
  const pageIdx = getPageIdx();

  const visible =
    Boolean(focusIdx) && (focusIdx !== pageIdx || configPanelOpen);

  return { visible, dismiss: dismissConfigPanel };
}
