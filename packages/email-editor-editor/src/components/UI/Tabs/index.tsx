import { classnames } from '@wa-dev/email-editor-shared';
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../Button';
import { Stack } from '../Stack';
import './index.scss';

export interface TabsProps {
  children?: React.ReactNode;
  tabBarExtraContent?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onChange?: (id: string) => void;
  onBeforeChange?: (current: string, next: string) => boolean;
  defaultActiveTab?: string;
  activeTab?: string;
}
export interface TabPaneProps {
  /** 与 activeTab 对齐的稳定 id，勿仅依赖 React key（受控时 key 可能读不到） */
  tabKey?: string;
  children?: React.ReactNode;
  tab: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

function getTabPanes(children: React.ReactNode): React.ReactElement<TabPaneProps>[] {
  return React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabPaneProps> => React.isValidElement(child),
  );
}

function getTabKey(item: React.ReactElement<TabPaneProps>, index: number): string {
  if (item.props.tabKey != null && item.props.tabKey !== '') {
    return String(item.props.tabKey);
  }
  if (item.key != null && String(item.key) !== '') {
    return String(item.key);
  }
  return `tab-${index}`;
}

const CHROME_HEADER_HEIGHT = 48;

const Tabs: React.FC<TabsProps> = props => {
  const isControlled = props.activeTab !== undefined && props.activeTab !== '';
  const [internalTab, setInternalTab] = useState(
    () => props.defaultActiveTab || props.activeTab || '',
  );

  const currentTab = isControlled ? String(props.activeTab) : internalTab;

  useEffect(() => {
    if (props.activeTab !== undefined) {
      setInternalTab(props.activeTab);
    }
  }, [props.activeTab]);

  const onClick = useCallback(
    (nextTab: string) => {
      if (props.onBeforeChange) {
        const allowed = props.onBeforeChange(currentTab, nextTab);
        if (!allowed) return;
      }
      if (!isControlled) {
        setInternalTab(nextTab);
      }
      props.onChange?.(nextTab);
    },
    [currentTab, isControlled, props],
  );

  const tabPanes = getTabPanes(props.children);

  return (
    <div
      style={props.style}
      className={classnames('ee-editor-tabs', props.className)}
    >
      <div className='wa-email-editor-editor-tabWrapper'>
        <Stack
          distribution='equalSpacing'
          alignment='center'
        >
          <div className='ee-mode-segment' role='tablist'>
            {tabPanes.map((item, index) => {
              const tabKey = getTabKey(item, index);
              const isActive = currentTab ? tabKey === currentTab : index === 0;
              return (
                <div
                  key={tabKey}
                  role='tab'
                  aria-selected={isActive}
                  onClick={() => onClick(tabKey)}
                  className={classnames(
                    'wa-email-editor-editor-tabItem',
                    isActive && 'wa-email-editor-editor-tabActiveItem',
                  )}
                >
                  <Button noBorder>
                    <>{item.props.tab}</>
                  </Button>
                </div>
              );
            })}
          </div>
          {props.tabBarExtraContent}
        </Stack>
      </div>
      {tabPanes.map((item, index) => {
        const tabKey = getTabKey(item, index);
        const visible = currentTab ? tabKey === currentTab : index === 0;
        return (
          <div
            key={tabKey}
            style={{
              display: visible ? undefined : 'none',
              height: `calc(100% - ${CHROME_HEADER_HEIGHT}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

const TabPane: React.FC<TabPaneProps> = props => {
  return <>{props.children}</>;
};

export { Tabs, TabPane };
