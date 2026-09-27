import { BlockLayerProps } from '@extensions/BlockLayer';
import { isEqual, omit } from 'lodash-es';
import React, { useContext, useMemo, useRef } from 'react';
import type { EmailEditorTheme } from '@wa-dev/email-editor-ui';

export type ConfigurationMode = 'right' | 'left-overlay';

export interface ExtensionProps extends BlockLayerProps {
  children?: React.ReactNode | React.ReactElement;
  categories: Array<
    | {
        label: string;
        active?: boolean;
        blocks: Array<{
          type: string;
          payload?: any;
          title?: string | undefined;
        }>;
        displayType?: 'grid';
      }
    | {
        label: string;
        active?: boolean;
        blocks: Array<{
          payload?: any;
          title?: string | undefined;
        }>;
        displayType: 'column';
      }
    | {
        label: string;
        active?: boolean;
        blocks: Array<{
          payload?: any;
        }>;
        displayType: 'widget';
      }
    | {
        label: string;
        active?: boolean;
        blocks: Array<React.ReactNode>;
        displayType: 'custom';
      }
  >;
  showSourceCode?: boolean;
  jsonReadOnly?: boolean;
  mjmlReadOnly?: boolean;
  compact?: boolean;
  showBlockLayer?: boolean;
  /**
   * 'right' — 配置面板在右侧独立列（默认，经典两侧布局）
   * 'left-overlay' — 左侧栏统一展示块/配置/源码/图层 Tab，右侧留给 AI 等自定义面板
   */
  configurationMode?: ConfigurationMode;
  /** 右侧自定义面板（当 configurationMode='left-overlay' 时可用于放置 AI 面板等） */
  rightPanel?: React.ReactNode;
  /**
   * 右侧自定义面板是否展开。为 false 时收起宽度但仍挂载内容，避免丢失内部状态。
   * 仅在传入 rightPanel 且 configurationMode='left-overlay' 时生效，默认 true。
   */
  rightPanelOpen?: boolean;
  /**
   * 编辑器 UI 主题：主题色、面板色与亮/暗模式。
   * 透传给 ConfigProvider，便于宿主项目与自身品牌主题对齐。
   */
  theme?: EmailEditorTheme;
}

export const ExtensionContext = React.createContext<ExtensionProps>({
  categories: [],
});

export const ExtensionProvider: React.FC<ExtensionProps> = props => {
  const value = omit(props, 'children');
  const valueRef = useRef(value);

  const cacheValue = useMemo(() => {
    if (!isEqual(value, valueRef.current)) {
      valueRef.current = value;
    }
    return valueRef.current;
  }, [value]);

  return (
    <ExtensionContext.Provider value={cacheValue}>
      {props.children}
    </ExtensionContext.Provider>
  );
};

export function useExtensionProps() {
  return useContext(ExtensionContext);
}
