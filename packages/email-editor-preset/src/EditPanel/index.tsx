import { Layout, Tabs } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { getPageIdx } from '@wa-dev/email-editor-blocks-react';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useRef, useState } from 'react';
import { Blocks } from './Blocks';
import { BlockLayer } from '@extensions/BlockLayer';
import { AttributePanel } from '@extensions/AttributePanel';
import { SourceCodePanel } from '@extensions/SourceCodePanel';
import { ConfigurationPanel } from '@extensions/ConfigurationPanel';
import { FullHeightOverlayScrollbars } from '@wa-dev/email-editor-ui';
import { ConfigurationDrawer } from './ConfigurationDrawer';
import { useExtensionProps, ConfigurationMode } from '@extensions/components/Providers/ExtensionProvider';
import {
  editPanelOverlayClass,
  editPanelOverlayStyle,
  editPanelSiderClass,
  editPanelTabsRootClass,
} from './editPanelTabs';

const TabPane = Tabs.TabPane;

export function EditPanel({
  showSourceCode,
  jsonReadOnly,
  mjmlReadOnly,
  configurationMode = 'right',
}: {
  showSourceCode: boolean;
  jsonReadOnly: boolean;
  mjmlReadOnly: boolean;
  configurationMode?: ConfigurationMode;
}) {
  const { height } = useEditorProps();
  const { compact = true, showBlockLayer = true } = useExtensionProps();
  const { focusIdx, setFocusIdx, notifyFocusSelection } = useFocusIdx();
  const pageIdx = getPageIdx();

  const useLeftOverlay = configurationMode === 'left-overlay';
  const isNonPageBlockSelected = Boolean(focusIdx) && focusIdx !== pageIdx;
  const showPageFourTabs = useLeftOverlay && focusIdx === pageIdx;
  const showBlockOverlay = useLeftOverlay && isNonPageBlockSelected;

  const [baseActiveTab, setBaseActiveTab] = useState('blocks');
  const [pageActiveTab, setPageActiveTab] = useState('blocks');
  const lastFocusIdx = useRef(focusIdx);
  const skipAutoPageConfigTab = useRef(false);

  useEffect(() => {
    if (!useLeftOverlay) return;
    if (focusIdx === lastFocusIdx.current) {
      if (focusIdx === pageIdx && !skipAutoPageConfigTab.current) {
        setPageActiveTab('config');
      }
      return;
    }
    lastFocusIdx.current = focusIdx;
    if (skipAutoPageConfigTab.current) {
      skipAutoPageConfigTab.current = false;
      return;
    }
    if (focusIdx === pageIdx) {
      setPageActiveTab('config');
    }
  }, [focusIdx, pageIdx, useLeftOverlay]);

  const handleBack = useMemoizedFn(() => {
    skipAutoPageConfigTab.current = true;
    lastFocusIdx.current = pageIdx;
    setFocusIdx(pageIdx);
    notifyFocusSelection();
    setPageActiveTab('blocks');
    setBaseActiveTab('blocks');
  });

  const handleBaseTabChange = useMemoizedFn((key: string) => {
    setBaseActiveTab(key);
  });

  const handlePageTabChange = useMemoizedFn((key: string) => {
    setPageActiveTab(key);
  });

  const blocksTab = (
    <TabPane tabKey='blocks' key='blocks' title={t`块`}>
      <FullHeightOverlayScrollbars height="100%">
        <Blocks />
      </FullHeightOverlayScrollbars>
    </TabPane>
  );

  const layerTab = showBlockLayer ? (
    <TabPane tabKey='layer' key='layer' title={t`图层`}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3">
        <div className="min-h-0 flex-1 overflow-hidden">
          <BlockLayer />
        </div>
      </div>
    </TabPane>
  ) : null;

  return (
    <Layout.Sider
      data-email-editor-sidebar
      className={editPanelSiderClass}
      style={{ height: '100%', minHeight: 0 }}
      collapsible
      trigger={null}
      breakpoint='xl'
      collapsedWidth={60}
      width={360}
    >
      {useLeftOverlay ? (
        <div className="relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden">
          <div
            className={
              showBlockOverlay
                ? 'relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden'
                : 'relative z-0 flex min-h-0 flex-1 flex-col'
            }
            aria-hidden={showBlockOverlay}
          >
            {showPageFourTabs ? (
              <Tabs
                key="edit-panel-page-tabs"
                className={editPanelTabsRootClass}
                activeTab={pageActiveTab}
                onChange={handlePageTabChange}
              >
                {blocksTab}
                <TabPane tabKey='config' key='config' title={t`配置`}>
                  <FullHeightOverlayScrollbars height="100%">
                    <AttributePanel key={focusIdx} />
                  </FullHeightOverlayScrollbars>
                </TabPane>
                {showSourceCode && (
                  <TabPane tabKey='source' destroyOnHide key='source' title={t`源码`}>
                    <FullHeightOverlayScrollbars height="100%">
                      <SourceCodePanel
                        key={focusIdx}
                        jsonReadOnly={jsonReadOnly}
                        mjmlReadOnly={mjmlReadOnly}
                      />
                    </FullHeightOverlayScrollbars>
                  </TabPane>
                )}
                {layerTab}
              </Tabs>
            ) : (
              <Tabs
                key="edit-panel-base-tabs"
                className={editPanelTabsRootClass}
                activeTab={baseActiveTab}
                onChange={handleBaseTabChange}
              >
                {blocksTab}
                {layerTab}
              </Tabs>
            )}
          </div>

          {showBlockOverlay && (
            <div
              className={editPanelOverlayClass}
              style={editPanelOverlayStyle}
              role="dialog"
              aria-label={t`块属性`}
            >
              <ConfigurationPanel
                key={focusIdx}
                showSourceCode={showSourceCode}
                height="100%"
                onBack={handleBack}
                jsonReadOnly={jsonReadOnly}
                mjmlReadOnly={mjmlReadOnly}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden">
          <Tabs className={editPanelTabsRootClass}>
            {blocksTab}
            {layerTab}
          </Tabs>

          {!compact && (
            <ConfigurationDrawer
              height={height}
              showSourceCode={showSourceCode}
              compact={Boolean(compact)}
              jsonReadOnly={jsonReadOnly}
              mjmlReadOnly={mjmlReadOnly}
            />
          )}
        </div>
      )}
    </Layout.Sider>
  );
}
