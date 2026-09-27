import React from 'react';
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
declare const Tabs: React.FC<TabsProps>;
declare const TabPane: React.FC<TabPaneProps>;
export { Tabs, TabPane };
//# sourceMappingURL=index.d.ts.map