import * as React from 'react'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'
import { panelDebug } from '../../utils/panelDebug'

type TabType = 'line' | 'card' | 'card-gutter' | 'text' | 'rounded' | 'capsule'
type TabSize = 'mini' | 'small' | 'default' | 'large'
type TabPosition = 'left' | 'right' | 'top' | 'bottom'

export interface TabsProps {
  activeTab?: string
  defaultActiveTab?: string
  type?: TabType
  size?: TabSize
  tabPosition?: TabPosition
  direction?: 'horizontal' | 'vertical'
  editable?: boolean
  showAddButton?: boolean
  destroyOnHide?: boolean
  lazyload?: boolean
  justify?: boolean
  animation?: boolean
  extra?: React.ReactNode
  /** 用自定义容器包裹默认标签栏（传入节点为可横向滚动的 TabsList 区域） */
  renderTabHeader?: (defaultTabBar: React.ReactNode) => React.ReactNode
  renderTabTitle?: (tabTitle: React.ReactNode, info: { key: string }) => React.ReactNode
  onChange?: (key: string) => void
  onClickTab?: (key: string) => void
  onAddTab?: () => void
  onDeleteTab?: (key: string) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab: controlledActiveTab,
  defaultActiveTab,
  type = 'line',
  size = 'default',
  direction = 'horizontal',
  extra,
  onChange,
  onClickTab,
  renderTabHeader,
  className,
  style,
  children,
}) => {
  const childArray = React.Children.toArray(children)

  const tabItems = childArray
    .filter(
      (child): child is React.ReactElement<TabPaneProps> =>
        React.isValidElement(child) && (child.type as React.FC).displayName === 'TabPane'
    )
    .map((child, index) => {
      let tabKey = ''
      if (child.props.tabKey != null && String(child.props.tabKey) !== '') {
        tabKey = String(child.props.tabKey)
      } else if (child.key != null && child.key !== '') {
        const k = String(child.key)
        if (!k.startsWith('.')) tabKey = k
      }
      if (!tabKey) tabKey = `tab-${index}`
      return {
        element: child,
        tabKey,
        props: child.props,
      }
    })

  const firstTabKey = tabItems[0]?.tabKey ?? ''
  const resolvedDefault = defaultActiveTab ?? firstTabKey
  const tabKeysFingerprint = tabItems.map((t) => t.tabKey).join('\0')

  const [internalActiveTab, setInternalActiveTab] = React.useState(
    () => controlledActiveTab ?? resolvedDefault
  )

  React.useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab)
      return
    }
    const keys = tabKeysFingerprint ? tabKeysFingerprint.split('\0') : []
    if (!keys.length) return
    const valid = keys.includes(internalActiveTab)
    if (!valid && firstTabKey) {
      setInternalActiveTab(firstTabKey)
    }
  }, [controlledActiveTab, tabKeysFingerprint, internalActiveTab, firstTabKey])

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    panelDebug('Tabs.activeTab', {
      activeTab,
      controlled: controlledActiveTab !== undefined,
      controlledActiveTab,
      internalActiveTab,
      tabKeys: tabItems.map((t) => t.tabKey),
    })
  }, [activeTab, controlledActiveTab, internalActiveTab, tabKeysFingerprint])

  React.useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    panelDebug('Tabs.panelLayout', {
      activeTab,
      mountedPanels: tabItems.filter((t) => t.tabKey === activeTab).map((t) => t.tabKey),
      panelRect: { w: rect.width, h: rect.height, top: rect.top, left: rect.left },
    })
  }, [activeTab, tabKeysFingerprint])

  const handleValueChange = (value: string) => {
    panelDebug('Tabs.onChange', { from: activeTab, to: value })
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(value)
    }
    onChange?.(value)
    onClickTab?.(value)
  }

  const sizeClasses: Record<TabSize, string> = {
    mini: 'text-xs h-7',
    small: 'text-sm h-8',
    default: 'text-sm h-9',
    large: 'text-base h-10',
  }

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    height: '100%',
    minHeight: 0,
    ...style,
  }

  const tabListWrapperClass = cn(
    'tabs-scroll-container flex items-center justify-start overflow-x-auto overflow-y-hidden rounded-none border-0',
    type !== 'line' && 'border-b border-[var(--color-border-2,#e5e6eb)]',
  )

  const tabListClass = cn(
    'inline-flex shrink-0 items-center justify-start gap-0 p-0',
    type === 'card' && 'rounded bg-[var(--color-fill-2,#f2f3f5)]',
    type === 'capsule' && 'rounded-full',
    type === 'line' && '!h-auto !rounded-none !bg-transparent !p-0 shadow-none',
  )

  const lineTabTriggerClass =
    type === 'line'
      ? cn(
          '!h-9 !min-h-9 !rounded-md !py-0 !px-3 !shadow-none',
          '!bg-transparent ring-0 ring-offset-0',
          'focus-visible:!ring-0 focus-visible:!ring-offset-0',
          'data-[state=active]:!bg-transparent data-[state=active]:!shadow-none',
        )
      : undefined

  const getTabTriggerStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    backgroundColor: isActive && type !== 'line' ? 'white' : 'transparent',
    color: isActive ? 'var(--color-primary, #165dff)' : 'var(--color-text-2, #4e5969)',
    borderBottom:
      type === 'line'
        ? isActive
          ? '2px solid var(--color-primary, #165dff)'
          : '2px solid transparent'
        : undefined,
    borderRadius: type === 'card' ? '4px' : type === 'capsule' ? '9999px' : undefined,
    transition: 'all 0.2s',
    ...(type === 'line'
      ? { height: 36, minHeight: 36, lineHeight: '36px', padding: '0 12px' }
      : { padding: '8px 16px' }),
  })

  const defaultTabBar = (
    <div className={cn(tabListWrapperClass, EDITOR_CLASS.tabsHeaderNav)}>
      <TabsList className={cn(tabListClass, EDITOR_CLASS.tabsHeader)}>
        {tabItems.map((item) => (
          <TabsTrigger
            key={item.tabKey}
            value={item.tabKey}
            disabled={item.props.disabled}
            className={lineTabTriggerClass}
            style={getTabTriggerStyle(activeTab === item.tabKey)}
          >
            {item.props.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )

  const tabBarContent = renderTabHeader ? renderTabHeader(defaultTabBar) : defaultTabBar

  const tabPanelClassName = cn(
    EDITOR_CLASS.tabsContent,
    'mt-0 box-border flex h-0 min-h-0 w-full flex-1 flex-col overflow-hidden',
    type === 'line' ? 'mt-0' : 'mt-2',
  )

  return (
    <ShadcnTabs
      value={activeTab}
      onValueChange={handleValueChange}
      orientation={direction}
      className={cn('tabs-scrollable', className)}
      style={tabsStyle}
    >
      <div className="flex shrink-0 min-w-0 max-w-full items-center justify-between overflow-hidden">
        {tabBarContent}
        {extra && <div className="ml-auto shrink-0">{extra}</div>}
      </div>

      <div
        ref={panelRef}
        className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden"
      >
        {tabItems.map((item) => {
          if (item.tabKey !== activeTab) return null
          return (
            <TabsContent
              key={item.tabKey}
              value={item.tabKey}
              className={tabPanelClassName}
            >
              {item.props.children}
            </TabsContent>
          )
        })}
      </div>
    </ShadcnTabs>
  )
}

Tabs.displayName = 'Tabs'

export interface TabPaneProps {
  tabKey?: string
  title?: React.ReactNode
  disabled?: boolean
  closable?: boolean
  destroyOnHide?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <>{children}</>
}

TabPane.displayName = 'TabPane'

const TabsNamespace = Object.assign(Tabs, {
  TabPane,
})

export default TabsNamespace
