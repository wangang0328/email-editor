import { Tabs } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import React from 'react';

import { AttributePanel } from '@extensions/AttributePanel';
import { SourceCodePanel } from '@extensions/SourceCodePanel';
import { FullHeightOverlayScrollbars } from '@wa-dev/email-editor-ui';
import { EditPanelTabHeader } from '@extensions/EditPanel/EditPanelTabHeader';
import {
  editPanelTabContentHeight,
  editPanelTabsRootClass,
} from '@extensions/EditPanel/editPanelTabs';

export interface ConfigurationPanelProps {
  showSourceCode: boolean;
  jsonReadOnly: boolean;
  mjmlReadOnly: boolean;
  height: string;
  onBack?: () => void;
  compact?: boolean;
}

export function ConfigurationPanel({
  showSourceCode,
  height,
  onBack,
  jsonReadOnly,
  mjmlReadOnly,
}: ConfigurationPanelProps) {
  const tabContentHeight =
    height === '100%' ? '100%' : editPanelTabContentHeight(height);

  const configBody = (
    <FullHeightOverlayScrollbars height={tabContentHeight}>
      <AttributePanel />
    </FullHeightOverlayScrollbars>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {showSourceCode ? (
        <Tabs
          className={editPanelTabsRootClass}
          defaultActiveTab='config'
          renderTabHeader={defaultTabBar => (
            <EditPanelTabHeader defaultTabBar={defaultTabBar} onBack={onBack} />
          )}
        >
          <Tabs.TabPane tabKey='config' key='config' title={t`配置`}>
            {configBody}
          </Tabs.TabPane>

          <Tabs.TabPane tabKey='source' destroyOnHide key='source' title={t`源码`}>
            <FullHeightOverlayScrollbars height={tabContentHeight}>
              <SourceCodePanel jsonReadOnly={jsonReadOnly} mjmlReadOnly={mjmlReadOnly} />
            </FullHeightOverlayScrollbars>
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <>
          {onBack ? (
            <EditPanelTabHeader defaultTabBar={null} onBack={onBack} />
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{configBody}</div>
        </>
      )}
    </div>
  );
}
