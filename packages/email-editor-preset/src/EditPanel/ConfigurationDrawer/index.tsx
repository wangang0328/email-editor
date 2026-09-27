import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { getPageIdx } from '@wa-dev/email-editor-blocks-react';

import { useConfigurationPanelVisible } from '@extensions/hooks/useConfigurationPanelVisible';
import { ConfigurationPanel } from '@extensions/ConfigurationPanel';
import { useMemoizedFn } from 'ahooks';
import React from 'react';

import { editPanelOverlayClass, editPanelOverlayStyle } from '../editPanelTabs';

export function ConfigurationDrawer({
  height,
  compact,
  showSourceCode,
  jsonReadOnly,
  mjmlReadOnly,
}: {
  height: string;
  compact: boolean;
  showSourceCode: boolean;
  jsonReadOnly: boolean;
  mjmlReadOnly: boolean;
}) {
  const { setFocusIdx } = useFocusIdx();
  const { visible, dismiss } = useConfigurationPanelVisible();

  const onClose = useMemoizedFn(() => {
    setFocusIdx(getPageIdx());
    dismiss();
  });

  if (!visible) return null;

  return (
    <div className={editPanelOverlayClass} style={editPanelOverlayStyle}>
      <ConfigurationPanel
        compact={compact}
        showSourceCode={showSourceCode}
        height={height}
        onBack={onClose}
        jsonReadOnly={jsonReadOnly}
        mjmlReadOnly={mjmlReadOnly}
      />
    </div>
  );
}
