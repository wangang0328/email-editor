import { Card, ConfigProvider, Layout } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useEditorProps } from '@wa-dev/email-editor-editor';
import React from 'react';
import { InteractivePrompt } from '../InteractivePrompt';
import styles from './index.module.scss';
import { MergeTagBadgePrompt } from '@extensions/MergeTagBadgePrompt';
import { EditPanel } from '../EditPanel';
import { ConfigurationPanel } from '@extensions/ConfigurationPanel';
import {
  ExtensionProps,
  ExtensionProvider,
} from '@extensions/components/Providers/ExtensionProvider';
import { AdvancedType } from '@wa-dev/email-editor-blocks-react';

const defaultCategories: ExtensionProps['categories'] = [
  {
    get label() {
      return t({ context: 'layout.category', message: '内容' });
    },
    active: true,
    blocks: [
      {
        type: AdvancedType.TEXT,
      },
      {
        type: AdvancedType.IMAGE,
        payload: { attributes: { padding: '0px 0px 0px 0px' } },
      },
      {
        type: AdvancedType.BUTTON,
      },
      {
        type: AdvancedType.SOCIAL,
      },
      {
        type: AdvancedType.DIVIDER,
      },
      {
        type: AdvancedType.SPACER,
      },
      {
        type: AdvancedType.HERO,
      },
      {
        type: AdvancedType.TABLE,
      },
    ],
  },
  {
    get label() {
      return t`布局`;
    },
    active: true,
    displayType: 'column',
    blocks: [
      {
        get title() {
          return t`2 栏`;
        },
        payload: [
          ['50%', '50%'],
          ['33%', '67%'],
          ['67%', '33%'],
          ['25%', '75%'],
          ['75%', '25%'],
        ],
      },
      {
        get title() {
          return t`3 栏`;
        },
        payload: [
          ['33.33%', '33.33%', '33.33%'],
          ['25%', '25%', '50%'],
          ['50%', '25%', '25%'],
        ],
      },
      {
        get title() {
          return t`4 栏`;
        },
        payload: [['25%', '25%', '25%', '25%']],
      },
    ],
  },
];

/** 右侧栏展示形态：由 compact / configurationMode / rightPanel 共同决定 */
type StandardLayoutRightSiderKind =
  | 'overlay-custom'
  | 'configuration'
  | 'collapsed';

function resolveStandardLayoutRightSiderKind(
  useLeftOverlay: boolean,
  compact: boolean,
  rightPanel: React.ReactNode | undefined,
): StandardLayoutRightSiderKind {
  if (useLeftOverlay && rightPanel) return 'overlay-custom';
  if (useLeftOverlay) return 'collapsed';
  if (compact) return 'configuration';
  return 'collapsed';
}

const OVERLAY_CUSTOM_SIDER_WIDTH = 480;
const CONFIGURATION_SIDER_STYLE = {
  minWidth: 300,
  maxWidth: 350,
  width: 350,
};

type StandardLayoutRightSiderProps = Pick<
  ExtensionProps,
  'showSourceCode' | 'jsonReadOnly' | 'mjmlReadOnly' | 'rightPanel' | 'rightPanelOpen'
> & {
  kind: StandardLayoutRightSiderKind;
  /** 与 PropsProvider / ConfigurationPanel 一致，一般为带单位的 CSS 高度 */
  containerHeight: string;
  compact: boolean;
};

/**
 * 标准布局右侧 `Layout.Sider`：按 kind 分支渲染，避免在页面组件里堆条件判断。
 * - overlay-custom：left-overlay 且传入 rightPanel
 * - configuration：紧凑模式下的内置配置面板
 * - collapsed：占位不占宽
 */
const StandardLayoutRightSider: React.FC<StandardLayoutRightSiderProps> = ({
  kind,
  containerHeight,
  compact,
  showSourceCode = true,
  jsonReadOnly = false,
  mjmlReadOnly = false,
  rightPanel,
  rightPanelOpen = true,
}) => {
  switch (kind) {
    case 'overlay-custom':
      return (
        <Layout.Sider
          width={OVERLAY_CUSTOM_SIDER_WIDTH}
          collapsed={!rightPanelOpen}
          collapsedWidth={0}
          style={{
            height: containerHeight,
            overflow: 'hidden',
            backgroundColor: 'var(--ee-panel-bg, #fafafa)',
            borderLeft: '1px solid var(--ee-panel-border, rgba(15,23,42,0.06))',
            ...(rightPanelOpen
              ? { minWidth: 400, maxWidth: 640 }
              : { minWidth: 0, maxWidth: 0, border: 'none' }),
          }}
        >
          {/* 固定内容宽度，收起时仍挂载以保留面板内部状态 */}
          <div
            style={{
              width: OVERLAY_CUSTOM_SIDER_WIDTH,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              visibility: rightPanelOpen ? 'visible' : 'hidden',
              pointerEvents: rightPanelOpen ? 'auto' : 'none',
            }}
          >
            {rightPanel}
          </div>
        </Layout.Sider>
      );
    case 'configuration':
      return (
        <Layout.Sider
          style={{
            height: containerHeight,
            backgroundColor: 'var(--ee-panel-bg, #fafafa)',
            borderLeft: '1px solid var(--ee-panel-border, rgba(15,23,42,0.06))',
            ...CONFIGURATION_SIDER_STYLE,
          }}
        >
          <ConfigurationPanel
            compact={compact}
            height={containerHeight}
            showSourceCode={showSourceCode}
            jsonReadOnly={jsonReadOnly}
            mjmlReadOnly={mjmlReadOnly}
          />
        </Layout.Sider>
      );
    case 'collapsed':
    default:
      return null;
      // return <Layout.Sider style={COLLAPSED_SIDER_STYLE} />;
  }
};

export const StandardLayout: React.FC<ExtensionProps> = props => {
  const { height: containerHeight } = useEditorProps();
  const {
    showSourceCode = true,
    compact = true,
    categories = defaultCategories,
    jsonReadOnly = false,
    mjmlReadOnly = false,
    configurationMode = 'right',
    rightPanel,
    rightPanelOpen = true,
    theme,
  } = props;

  const useLeftOverlay = configurationMode === 'left-overlay';
  const rightSiderKind = resolveStandardLayoutRightSiderKind(
    useLeftOverlay,
    compact,
    rightPanel,
  );

  return (
    <ExtensionProvider
      {...props}
      categories={categories}
    >
      <ConfigProvider theme={theme}>
        <Card
          style={{ padding: 0 }}
          bodyStyle={{
            padding: 0,
            height: containerHeight,
            overflow: 'hidden',
          }}
        >
          <Layout
            className={styles.StandardLayout}
            style={{
              display: 'flex',
              width: '100%',
              height: containerHeight,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* 紧凑模式：EditPanel（区块、图层、属性、源码等 Tab）排在主画布左侧 */}
            {compact && (
              <EditPanel
                showSourceCode={showSourceCode}
                jsonReadOnly={jsonReadOnly}
                mjmlReadOnly={mjmlReadOnly}
                configurationMode={configurationMode}
              />
            )}
            <Layout
              className="min-h-0 min-w-0 flex-1 overflow-hidden"
              style={{ height: containerHeight, minHeight: 0 }}
            >
              {props.children}
            </Layout>
            {/* 非紧凑模式：同一 EditPanel 改到主画布右侧，避免与中间编辑区挤在一侧 */}
            {!compact && (
              <EditPanel
                showSourceCode={showSourceCode}
                jsonReadOnly={jsonReadOnly}
                mjmlReadOnly={mjmlReadOnly}
                configurationMode={configurationMode}
              />
            )}
            <StandardLayoutRightSider
              kind={rightSiderKind}
              containerHeight={containerHeight}
              compact={compact}
              showSourceCode={showSourceCode}
              jsonReadOnly={jsonReadOnly}
              mjmlReadOnly={mjmlReadOnly}
              rightPanel={rightPanel}
              rightPanelOpen={rightPanelOpen}
            />
          </Layout>
        </Card>
        <InteractivePrompt />
        <MergeTagBadgePrompt />
      </ConfigProvider>
    </ExtensionProvider>
  );
};
