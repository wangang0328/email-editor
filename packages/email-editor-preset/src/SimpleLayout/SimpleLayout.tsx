import { Button, Card, ConfigProvider, Layout, Tabs } from '@wa-dev/email-editor-ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@lingui/core/macro';
import { ShortcutToolbar } from '../ShortcutToolbar';
import { useEditorProps } from '@wa-dev/email-editor-editor';
import React, { useState } from 'react';
import { SourceCodePanel } from '../SourceCodePanel';
import { AttributePanel } from '../AttributePanel';
import { BlockLayer, BlockLayerProps } from '../BlockLayer';
import { InteractivePrompt } from '../InteractivePrompt';
import styles from './index.module.scss';
import { MergeTagBadgePrompt } from '@extensions/MergeTagBadgePrompt';

export const SimpleLayout: React.FC<
  {
    showSourceCode?: boolean;
    jsonReadOnly?: boolean;
    mjmlReadOnly?: boolean;
    defaultShowLayer?: boolean;
    children: React.ReactNode | React.ReactElement;
  } & BlockLayerProps
> = props => {
  const { height: containerHeight } = useEditorProps();
  const {
    showSourceCode = true,
    defaultShowLayer = true,
    jsonReadOnly = false,
    mjmlReadOnly = false,
  } = props;
  const [collapsed, setCollapsed] = useState(!defaultShowLayer);
  return (
    <ConfigProvider>
      <Layout
        className={styles.SimpleLayout}
        style={{
          display: 'flex',
          width: '100%',
          overflow: 'hidden',
          minWidth: 1400,
        }}
      >
        <Layout.Sider
          style={{ paddingRight: 0 }}
          collapsed={collapsed}
          collapsible
          trigger={null}
          breakpoint='xl'
          collapsedWidth={60}
          width={300}
        >
          <Card
            bodyStyle={{ padding: 0 }}
            style={{ border: 'none' }}
          >
            <Card.Grid style={{ width: 60, textAlign: 'center' }}>
              <ShortcutToolbar />
              <Button
                style={{
                  marginTop: 30,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                icon={collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                shape='round'
                onClick={() => setCollapsed(v => !v)}
              />
            </Card.Grid>
            <Card.Grid
              className={styles.customScrollBar}
              style={{
                flex: 1,
                paddingBottom: 50,
                border: 'none',
                height: containerHeight,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <Card
                title={t`图层`}
                style={{ border: 'none' }}
                headerStyle={{ height: 50 }}
              >
                {!collapsed && <BlockLayer renderTitle={props.renderTitle} />}
              </Card>
            </Card.Grid>
          </Card>
        </Layout.Sider>

        <Layout style={{ height: containerHeight }}>{props.children}</Layout>

        <Layout.Sider
          style={{
            height: containerHeight,
            minWidth: 300,
            maxWidth: 350,
            width: 350,
          }}
          className={styles.rightSide}
        >
          <Card
            size='small'
            id='rightSide'
            style={{
              maxHeight: '100%',
              height: '100%',
              borderLeft: 'none',
            }}
            bodyStyle={{ padding: 0 }}
            className={styles.customScrollBarV2}
          >
            <Tabs className={styles.layoutTabs} defaultActiveTab='config'>
              <Tabs.TabPane
                tabKey='config'
                key='config'
                title={
                  <div style={{ height: 31, lineHeight: '31px' }}>
                    {t`配置`}
                  </div>
                }
              >
                <AttributePanel />
              </Tabs.TabPane>
              {showSourceCode && (
                <Tabs.TabPane
                  tabKey='source'
                  destroyOnHide
                  key='source'
                  title={
                    <div style={{ height: 31, lineHeight: '31px' }}>
                      {t`源码`}
                    </div>
                  }
                >
                  <SourceCodePanel
                    jsonReadOnly={jsonReadOnly}
                    mjmlReadOnly={mjmlReadOnly}
                  />
                </Tabs.TabPane>
              )}
            </Tabs>
          </Card>
        </Layout.Sider>

        <InteractivePrompt />
        <MergeTagBadgePrompt />
      </Layout>
    </ConfigProvider>
  );
};
