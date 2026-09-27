import { t } from '@lingui/core/macro';
import React, { useMemo, useCallback } from 'react';
import { Stack } from '../UI/Stack';
import { ToolsPanel } from './components/ToolsPanel';
import { createPortal } from 'react-dom';
import { EASY_EMAIL_EDITOR_ID, FIXED_CONTAINER_ID } from '@/constants';
import { useActiveTab } from '@/hooks/useActiveTab';
import { ActiveTabKeys } from '../Provider/BlocksProvider';
import { DesktopEmailPreview } from './components/DesktopEmailPreview';
import { MobileEmailPreview } from './components/MobileEmailPreview';
import { EditEmailPreview } from './components/EditEmailPreview';
import { TabPane, Tabs } from '@/components/UI/Tabs';
import { Monitor, PenLine, Smartphone } from 'lucide-react';
import { useEditorProps } from '@/hooks/useEditorProps';
import './index.scss';
import { EventManager, EventType } from '@/utils/EventManager';
import { perfReport } from '@wa-dev/email-editor-shared';

(window as any).global = window; // react-codemirror

/** 与左侧属性栏 / EditPanel Tab 对齐的顶栏高度 */
export const EDITOR_CHROME_HEADER_HEIGHT_PX = 48;

export const EmailEditor = () => {
  const { height: containerHeight } = useEditorProps();
  const { setActiveTab, activeTab } = useActiveTab();

  const fixedContainer = useMemo(() => {
    return createPortal(<div id={FIXED_CONTAINER_ID} />, document.body);
  }, []);

  const onBeforeChangeTab = useCallback((currentTab: any, nextTab: any) => {
    return EventManager.exec(EventType.ACTIVE_TAB_CHANGE, { currentTab, nextTab });
  }, []);

  const onChangeTab = useCallback(
    (nextTab: string) => {
      const from = activeTab;
      const start = performance.now();
      setActiveTab(nextTab as ActiveTabKeys);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          perfReport('editor.tabChange', {
            from,
            to: nextTab,
            switchMs: performance.now() - start,
          });
        });
      });
    },
    [activeTab, setActiveTab],
  );

  return useMemo(
    () => (
      <div
        id={EASY_EMAIL_EDITOR_ID}
        style={{
          display: 'flex',
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'hidden',
          justifyContent: 'center',
          minWidth: 640,
          height: '100%',
          maxHeight: containerHeight,
        }}
      >
        <Tabs
          activeTab={activeTab}
          onBeforeChange={onBeforeChangeTab}
          onChange={onChangeTab}
          style={{ height: '100%', width: '100%' }}
          className="ee-canvas-chrome"
          tabBarExtraContent={<ToolsPanel />}
        >
          <TabPane
            tabKey={ActiveTabKeys.EDIT}
            style={{ height: `calc(100% - ${EDITOR_CHROME_HEADER_HEIGHT_PX}px)` }}
            tab={(
              <span className="ee-mode-tab-inner" title={t`编辑`}>
                <PenLine size={15} />
                <span className="ee-mode-tab-label">{t`编辑`}</span>
              </span>
            )}
            key={ActiveTabKeys.EDIT}
          >
            <EditEmailPreview />
          </TabPane>
          <TabPane
            tabKey={ActiveTabKeys.PC}
            style={{ height: `calc(100% - ${EDITOR_CHROME_HEADER_HEIGHT_PX}px)` }}
            tab={(
              <span className="ee-mode-tab-inner" title={t`桌面`}>
                <Monitor size={15} />
                <span className="ee-mode-tab-label">{t`桌面`}</span>
              </span>
            )}
            key={ActiveTabKeys.PC}
          >
            <DesktopEmailPreview />
          </TabPane>
          <TabPane
            tabKey={ActiveTabKeys.MOBILE}
            style={{ height: `calc(100% - ${EDITOR_CHROME_HEADER_HEIGHT_PX}px)` }}
            tab={(
              <span className="ee-mode-tab-inner" title={t`手机`}>
                <Smartphone size={15} />
                <span className="ee-mode-tab-label">{t`手机`}</span>
              </span>
            )}
            key={ActiveTabKeys.MOBILE}
          >
            <MobileEmailPreview />
          </TabPane>
        </Tabs>
        <>{fixedContainer}</>
      </div>
    ),
    [activeTab, containerHeight, fixedContainer, onBeforeChangeTab, onChangeTab]
  );
};
