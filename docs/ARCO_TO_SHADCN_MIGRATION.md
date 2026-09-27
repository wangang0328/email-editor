# Arco Design → shadcn/ui 完整迁移指南

## 概述

本文档详细记录从 Arco Design 迁移到 shadcn/ui 的完整方案，包括每个组件的替代方案、API 映射和实现细节。

### 迁移背景

| 问题 | 影响 |
|------|------|
| Arco Design 不支持 Next.js 15 App Router | Server Components 无法使用 |
| React 19 兼容性需要额外 adapter | 维护成本增加 |
| 旧版本存在安全漏洞 | 无法降级规避 |
| 社区生态相对较小 | 长期维护风险 |

### 迁移目标

- ✅ 完全兼容 Next.js 15 App Router
- ✅ 原生支持 React 19 + Server Components
- ✅ 统一使用 Tailwind CSS 样式系统
- ✅ 所有组件有明确替代方案

---

## 一、依赖变更清单

### 1.1 移除的依赖

```json
{
  "@arco-design/web-react": "^2.36.1"
}
```

### 1.2 新增的依赖

```json
{
  "dependencies": {
    // shadcn/ui 核心
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.400.0",
    
    // Radix UI 基础组件 (shadcn 底层)
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-checkbox": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    
    // 第三方替代组件
    "react-arborist": "^3.4.0",
    "@headless-tree/core": "^1.6.0",
    "@headless-tree/react": "^1.6.0",
    "sonner": "^1.4.0",
    "vaul": "^0.9.0",
    "cmdk": "^1.0.0",
    "react-colorful": "^5.6.0",
    "@tanstack/react-virtual": "^3.13.0",
    
    // 表单
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 二、组件迁移详细对照表

### 图例说明

| 符号 | 含义 |
|------|------|
| ✅ | shadcn/ui 原生支持 |
| 📦 | 需要第三方库 |
| 🔧 | 需要自定义实现 |
| 🎨 | 仅需 Tailwind CSS |

---

## 三、布局组件

### 3.1 Layout / Layout.Sider

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 布局容器 | 🔧 自定义 + shadcn Resizable |
| **使用文件** | 3 个 |  |

#### 当前用法

```tsx
// StandardLayout.tsx
<Layout style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
  <Layout.Sider
    collapsible
    trigger={null}
    breakpoint='xl'
    collapsedWidth={60}
    width={360}
    style={{ paddingRight: 0, minWidth: 360 }}
  >
    {/* 内容 */}
  </Layout.Sider>
  <Layout style={{ height: containerHeight, flex: 1 }}>
    {children}
  </Layout>
</Layout>
```

#### 替代方案：shadcn Resizable + 自定义

```tsx
// components/ui/layout.tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex w-full overflow-hidden", className)}>
      {children}
    </div>
  )
}

interface SiderProps {
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sider({ 
  children, 
  defaultSize = 25,
  minSize = 15,
  maxSize = 40,
  collapsible,
  collapsed,
  onCollapse
}: SiderProps) {
  return (
    <ResizablePanel 
      defaultSize={defaultSize}
      minSize={collapsed ? 5 : minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      onCollapse={() => onCollapse?.(true)}
      onExpand={() => onCollapse?.(false)}
    >
      {children}
    </ResizablePanel>
  )
}

// 使用示例
<ResizablePanelGroup direction="horizontal">
  <Sider defaultSize={25} minSize={15} collapsible>
    <EditPanel />
  </Sider>
  <ResizableHandle />
  <ResizablePanel defaultSize={75}>
    <EmailEditor />
  </ResizablePanel>
</ResizablePanelGroup>
```

---

### 3.2 Grid.Row / Grid.Col 🎨

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 栅格布局 | Tailwind CSS Grid/Flex |
| **使用文件** | 26 个 |  |
| **span** | 3, 7, 11, 12, 16, 24 | grid-cols-24 + col-span-* |
| **offset** | 1 | col-start-* |
| **justify** | space-between | justify-between |
| **align** | end | items-end |
| **gutter** | 未使用 | gap-* |

#### 当前用法

```tsx
<Grid.Row>
  <Grid.Col span={11}>
    <Input />
  </Grid.Col>
  <Grid.Col span={11} offset={1}>
    <Input />
  </Grid.Col>
</Grid.Row>

<Grid.Row justify='space-between' align='end'>
  <Grid.Col span={7}><Field1 /></Grid.Col>
  <Grid.Col span={7}><Field2 /></Grid.Col>
  <Grid.Col span={7}><Field3 /></Grid.Col>
  <Grid.Col span={3}><Button /></Grid.Col>
</Grid.Row>
```

#### 替代方案：Tailwind Grid 工具类

```tsx
// components/ui/grid.tsx
import { cn } from "@/lib/utils"

interface GridRowProps {
  children: React.ReactNode
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  gap?: number
  className?: string
}

const justifyMap = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const alignMap = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
}

export function GridRow({ 
  children, 
  justify = 'start',
  align = 'stretch',
  gap = 4,
  className 
}: GridRowProps) {
  return (
    <div className={cn(
      "grid grid-cols-24",
      `gap-${gap}`,
      justifyMap[justify],
      alignMap[align],
      className
    )}>
      {children}
    </div>
  )
}

interface GridColProps {
  children: React.ReactNode
  span?: number
  offset?: number
  className?: string
}

export function GridCol({ 
  children, 
  span = 24, 
  offset = 0,
  className 
}: GridColProps) {
  return (
    <div className={cn(
      `col-span-${span}`,
      offset > 0 && `col-start-${offset + 1}`,
      className
    )}>
      {children}
    </div>
  )
}

// tailwind.config.js 需要扩展
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-11': 'span 11 / span 11',
        'span-7': 'span 7 / span 7',
        'span-3': 'span 3 / span 3',
        // ... 其他需要的 span 值
      }
    }
  }
}
```

#### 简化版（推荐大多数场景）

```tsx
// 直接使用 Tailwind，不需要包装组件
// 原: <Grid.Row><Grid.Col span={12}>A</Grid.Col><Grid.Col span={12}>B</Grid.Col></Grid.Row>
// 新:
<div className="grid grid-cols-2 gap-4">
  <div>A</div>
  <div>B</div>
</div>

// 原: span={11} + span={11} offset={1} (两列，中间有间隔)
// 新:
<div className="grid grid-cols-[11fr_1fr_11fr]">
  <div>左</div>
  <div /> {/* 占位 */}
  <div>右</div>
</div>

// 或使用 gap
<div className="grid grid-cols-2 gap-6">
  <div>左</div>
  <div>右</div>
</div>
```

---

### 3.3 Space 🎨

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 间距容器 | Tailwind Flex + gap |
| **使用文件** | 24 个 |  |
| **direction** | vertical/horizontal | flex-col / flex-row |
| **size** | mini/small/large | gap-1/2/4 |
| **align** | center/start/end | items-* |

#### 当前用法

```tsx
<Space direction='vertical' size='large'>
  <Input />
  <Button />
</Space>

<Space align='center' size='mini'>
  <Icon />
  <Text />
</Space>
```

#### 替代方案

```tsx
// components/ui/space.tsx
import { cn } from "@/lib/utils"

interface SpaceProps {
  children: React.ReactNode
  direction?: 'horizontal' | 'vertical'
  size?: 'mini' | 'small' | 'medium' | 'large' | number
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  className?: string
}

const sizeMap = {
  mini: 'gap-1',
  small: 'gap-2',
  medium: 'gap-4',
  large: 'gap-6',
}

const alignMap = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
}

export function Space({
  children,
  direction = 'horizontal',
  size = 'small',
  align = 'center',
  wrap = false,
  className,
}: SpaceProps) {
  const gapClass = typeof size === 'string' ? sizeMap[size] : undefined
  const gapStyle = typeof size === 'number' ? { gap: size } : undefined

  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        gapClass,
        alignMap[align],
        wrap && 'flex-wrap',
        className
      )}
      style={gapStyle}
    >
      {children}
    </div>
  )
}

// 简化: 直接用 Tailwind
<div className="flex gap-4 items-center">...</div>
<div className="flex flex-col gap-2">...</div>
```

---

## 四、数据展示组件

### 4.1 Collapse / Collapse.Item ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 折叠面板 | shadcn Accordion |
| **使用文件** | 25 个 |  |
| **activeKey** | 受控展开 | value |
| **defaultActiveKey** | 默认展开 | defaultValue |
| **onChange** | 展开回调 | onValueChange |
| **destroyOnHide** | 卸载内容 | 需自定义 |

#### 当前用法

```tsx
<Collapse 
  activeKey={activeKeys} 
  onChange={(key, keys) => setActiveKeys(keys)}
>
  <Collapse.Item 
    name='section1' 
    header='标题'
    contentStyle={{ padding: '0 20px' }}
    extra={<Switch />}
    destroyOnHide
  >
    内容
  </Collapse.Item>
</Collapse>
```

#### 替代方案：shadcn Accordion

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// 单选模式
<Accordion type="single" collapsible defaultValue="section1">
  <AccordionItem value="section1">
    <AccordionTrigger>
      <div className="flex items-center justify-between w-full">
        <span>标题</span>
        <Switch onClick={(e) => e.stopPropagation()} />
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-5">
      内容
    </AccordionContent>
  </AccordionItem>
</Accordion>

// 多选模式
<Accordion type="multiple" value={activeKeys} onValueChange={setActiveKeys}>
  ...
</Accordion>

// destroyOnHide 需要自定义
const AccordionContentWithDestroy = ({ children, ...props }) => {
  const context = useAccordionContext()
  const isOpen = context.value.includes(props.value)
  
  return (
    <AccordionContent {...props}>
      {isOpen ? children : null}
    </AccordionContent>
  )
}
```

---

### 4.2 Tabs / Tabs.TabPane ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 选项卡 | shadcn Tabs |
| **使用文件** | 5 个 |  |
| **defaultActiveTab** | 默认选中 | defaultValue |
| **activeTab** | 受控选中 | value |
| **onChange** | 切换回调 | onValueChange |
| **type='card'** | 卡片样式 | 自定义 className |
| **tabPosition** | 标签位置 | 需自定义布局 |
| **editable** | 可编辑 | 需自定义 |
| **renderTabHeader** | 自定义头部 | 需包装 |
| **destroyOnHide** | 卸载内容 | 需自定义 |

#### 当前用法

```tsx
<Tabs 
  defaultActiveTab='2'
  style={{ width: '100%' }}
  renderTabHeader={(_, DefaultHeader) => (
    <div className={styles.scrollableTabsHeader}>
      <DefaultHeader />
    </div>
  )}
>
  <Tabs.TabPane key='1' title='块'>内容1</Tabs.TabPane>
  <Tabs.TabPane key='2' title='层级' destroyOnHide>内容2</Tabs.TabPane>
</Tabs>
```

#### 替代方案：shadcn Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="2" className="w-full">
  <div className="overflow-x-auto scrollbar-thin">
    <TabsList>
      <TabsTrigger value="1">块</TabsTrigger>
      <TabsTrigger value="2">层级</TabsTrigger>
    </TabsList>
  </div>
  <TabsContent value="1">内容1</TabsContent>
  <TabsContent value="2">内容2</TabsContent>
</Tabs>

// 可编辑 Tabs 需要自定义
interface EditableTabsProps {
  tabs: { key: string; title: string }[]
  onAdd: () => void
  onDelete: (key: string) => void
}

function EditableTabs({ tabs, onAdd, onDelete }: EditableTabsProps) {
  return (
    <Tabs>
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger key={tab.key} value={tab.key} className="group">
            {tab.title}
            <button 
              className="ml-2 opacity-0 group-hover:opacity-100"
              onClick={() => onDelete(tab.key)}
            >
              <X className="w-3 h-3" />
            </button>
          </TabsTrigger>
        ))}
        <button onClick={onAdd}><Plus className="w-4 h-4" /></button>
      </TabsList>
    </Tabs>
  )
}
```

---

### 4.3 Tree 📦

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 树形控件 | react-arborist |
| **使用文件** | 2 个（核心功能） |  |
| **draggable** | 拖拽排序 | ✅ 支持 |
| **allowDrop** | 拖放验证 | ✅ disableDrop |
| **onDrop** | 拖放回调 | ✅ onMove |
| **treeData** | 数据源 | ✅ data |
| **selectedKeys** | 选中项 | ✅ selection |
| **expandedKeys** | 展开项 | ✅ 内置状态 |
| **renderTitle** | 自定义渲染 | ✅ 完全自定义 |
| **blockNode** | 块级节点 | ✅ 默认 |
| **fieldNames** | 字段映射 | ✅ idAccessor/childrenAccessor |

#### 当前用法 (BlockTree)

```tsx
import { Tree, AllowDrop, NodeInstance, TreeProps } from '@arco-design/web-react'

<Tree
  treeData={treeData}
  fieldNames={{ key: 'id' }}
  selectedKeys={selectedKeys}
  expandedKeys={expandedKeys}
  onExpand={setExpandedKeys}
  draggable
  onDragStart={(e, node) => handleDragStart(node)}
  onDrop={({ dragNode, dropNode, dropPosition }) => handleDrop(...)}
  allowDrop={({ dragNode, dropNode, dropPosition }) => canDrop(...)}
  onSelect={(keys) => onSelect(keys[0])}
  size='small'
  blockNode
  renderTitle={(node) => <CustomTitle node={node} />}
/>
```

#### 替代方案：react-arborist

```tsx
// components/block-tree/index.tsx
import { Tree, NodeRendererProps, NodeApi } from 'react-arborist'

interface BlockNode {
  id: string
  name: string
  type: string
  children?: BlockNode[]
}

interface BlockTreeProps {
  data: BlockNode[]
  selectedId?: string
  onSelect?: (id: string) => void
  onMove?: (args: {
    dragIds: string[]
    parentId: string | null
    index: number
  }) => void
}

export function BlockTree({ data, selectedId, onSelect, onMove }: BlockTreeProps) {
  return (
    <Tree<BlockNode>
      data={data}
      selection={selectedId}
      onSelect={(nodes) => onSelect?.(nodes[0]?.id)}
      onMove={onMove}
      
      // 样式
      rowHeight={32}
      indent={24}
      padding={8}
      
      // 拖拽控制
      disableDrag={(node) => node.data.type === 'page'}
      disableDrop={({ parentNode, dragNodes }) => {
        // 实现 allowDrop 逻辑
        if (!parentNode) return false
        return !canDropInto(parentNode.data.type, dragNodes[0].data.type)
      }}
      
      // 展开控制
      openByDefault={false}
    >
      {BlockNode}
    </Tree>
  )
}

// 节点渲染组件
function BlockNode({ node, style, dragHandle }: NodeRendererProps<BlockNode>) {
  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-1 cursor-pointer rounded",
        "hover:bg-accent",
        node.isSelected && "bg-primary/10 text-primary"
      )}
      onContextMenu={(e) => handleContextMenu(e, node)}
    >
      {/* 展开图标 */}
      {node.children?.length > 0 && (
        <button onClick={() => node.toggle()}>
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform",
            node.isOpen && "rotate-90"
          )} />
        </button>
      )}
      
      {/* 类型图标 */}
      <BlockIcon type={node.data.type} />
      
      {/* 名称 */}
      <span className="flex-1 truncate">{node.data.name}</span>
    </div>
  )
}
```

**API 映射表**

| Arco Tree | react-arborist | 说明 |
|-----------|----------------|------|
| `treeData` | `data` | 数据源 |
| `fieldNames.key` | `idAccessor` | ID 字段映射 |
| `selectedKeys` | `selection` | 选中状态 |
| `expandedKeys` | 内置管理 | 通过 node.toggle() |
| `onExpand` | 内置管理 | 无需 |
| `draggable` | 默认支持 | - |
| `allowDrop` | `disableDrop` | 逻辑取反 |
| `onDrop` | `onMove` | 签名不同 |
| `onDragStart` | `onDragStart` | 相似 |
| `onSelect` | `onSelect` | 签名不同 |
| `renderTitle` | children | 完全自定义 |
| `size` | `rowHeight` | 数值 |

---

### 4.4 TreeSelect 📦

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 树选择器 | @headless-tree/react + Popover |
| **使用文件** | 2 个 |  |

#### 当前用法

```tsx
<TreeSelect
  value={value}
  size='small'
  dropdownMenuStyle={{ maxHeight: 400, overflow: 'auto' }}
  placeholder={t`请选择`}
  treeData={treeOptions}
  onChange={(val) => onSelect(val)}
/>
```

#### 替代方案：Headless Tree + shadcn Popover

```tsx
// components/ui/tree-select.tsx
import { useTree } from '@headless-tree/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface TreeSelectProps<T> {
  data: T[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  getItemId: (item: T) => string
  getItemName: (item: T) => string
  getChildren?: (item: T) => T[] | undefined
}

export function TreeSelect<T>({
  data,
  value,
  onChange,
  placeholder = "请选择",
  getItemId,
  getItemName,
  getChildren,
}: TreeSelectProps<T>) {
  const [open, setOpen] = useState(false)
  
  const tree = useTree<T>({
    data,
    getItemId,
    getChildren,
    onSelectItem: (item) => {
      onChange?.(getItemId(item))
      setOpen(false)
    },
  })
  
  const selectedItem = data.find(item => getItemId(item) === value)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedItem ? getItemName(selectedItem) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-h-[400px] overflow-auto">
        <div {...tree.getContainerProps()}>
          {tree.virtualItems.map((item) => (
            <div
              key={item.id}
              {...tree.getItemProps(item)}
              className={cn(
                "px-2 py-1.5 cursor-pointer hover:bg-accent",
                item.isSelected && "bg-primary/10"
              )}
              style={{ paddingLeft: item.depth * 16 + 8 }}
            >
              {item.hasChildren && (
                <button onClick={() => tree.toggleExpand(item)}>
                  <ChevronRight className={cn(
                    "w-4 h-4",
                    item.isExpanded && "rotate-90"
                  )} />
                </button>
              )}
              {getItemName(item.data)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

---

### 4.5 List 🔧

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 列表 | 自定义组件 |
| **使用文件** | 1 个 (Condition.tsx) |  |

#### 当前用法

```tsx
<List
  header={<div>条件列表</div>}
  dataSource={conditions}
  render={(item, index) => (
    <List.Item key={index}>
      <ConditionItem {...item} />
    </List.Item>
  )}
/>
```

#### 替代方案：自定义列表

```tsx
// components/ui/list.tsx
interface ListProps<T> {
  header?: React.ReactNode
  dataSource: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function List<T>({ header, dataSource, renderItem, className }: ListProps<T>) {
  return (
    <div className={cn("border rounded-lg", className)}>
      {header && (
        <div className="px-4 py-3 border-b bg-muted/50 font-medium">
          {header}
        </div>
      )}
      <ul className="divide-y">
        {dataSource.map((item, index) => (
          <li key={index} className="px-4 py-3">
            {renderItem(item, index)}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 五、数据录入组件

### 5.1 Input / Input.TextArea / Input.Search ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 输入框 | shadcn Input + Textarea |
| **使用文件** | 9 个 |  |

#### 替代方案

```tsx
// Input
import { Input } from "@/components/ui/input"
<Input value={value} onChange={(e) => onChange(e.target.value)} />

// TextArea
import { Textarea } from "@/components/ui/textarea"
<Textarea 
  value={value} 
  onChange={(e) => onChange(e.target.value)}
  className="min-h-[100px]"
/>

// Search - 自定义
function SearchInput({ onSearch, ...props }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input 
        className="pl-10" 
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.(e.currentTarget.value)}
        {...props} 
      />
    </div>
  )
}
```

---

### 5.2 InputNumber 🔧

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 数字输入 | 自定义 Input + 按钮 |
| **使用文件** | 1 个 (enhancer) |  |

#### 替代方案

```tsx
// components/ui/input-number.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface InputNumberProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function InputNumber({
  value = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled,
}: InputNumberProps) {
  const handleChange = (newValue: number) => {
    const clamped = Math.min(max, Math.max(min, newValue))
    onChange?.(clamped)
  }

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-r-none"
        onClick={() => handleChange(value - step)}
        disabled={disabled || value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-l-none"
        onClick={() => handleChange(value + step)}
        disabled={disabled || value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

---

### 5.3 Select ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 选择器 | shadcn Select |
| **使用文件** | 1 个 (封装) |  |

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 5.4 Checkbox / Checkbox.Group ✅

```tsx
import { Checkbox } from "@/components/ui/checkbox"

// 单个
<Checkbox checked={checked} onCheckedChange={setChecked} />

// 组 - 自定义
function CheckboxGroup({ options, value, onChange }) {
  const handleChange = (optValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optValue])
    } else {
      onChange(value.filter(v => v !== optValue))
    }
  }
  
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2">
          <Checkbox
            checked={value.includes(opt.value)}
            onCheckedChange={(checked) => handleChange(opt.value, !!checked)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
```

---

### 5.5 Radio / Radio.Group ✅

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

<RadioGroup value={value} onValueChange={onChange}>
  {options.map(opt => (
    <div key={opt.value} className="flex items-center gap-2">
      <RadioGroupItem value={opt.value} id={opt.value} />
      <Label htmlFor={opt.value}>{opt.label}</Label>
    </div>
  ))}
</RadioGroup>
```

---

### 5.6 Switch ✅

```tsx
import { Switch } from "@/components/ui/switch"

<Switch checked={checked} onCheckedChange={setChecked} />
```

---

### 5.7 Slider ✅

```tsx
import { Slider } from "@/components/ui/slider"

<Slider 
  value={[value]} 
  onValueChange={([v]) => onChange(v)}
  min={0}
  max={100}
  step={1}
/>
```

---

### 5.8 AutoComplete 🔧

```tsx
// 使用 cmdk 或自定义
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function AutoComplete({ options, value, onChange, onSearch }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            onSearch?.(e.target.value)
            setOpen(true)
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            {options.map(opt => (
              <CommandItem
                key={opt.value}
                onSelect={() => {
                  onChange(opt.value)
                  setSearch(opt.label)
                  setOpen(false)
                }}
              >
                {opt.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

---

### 5.9 ColorPicker 📦

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 颜色选择器 | react-colorful |
| **使用文件** | 多个 |  |

```tsx
// components/ui/color-picker.tsx
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
}

export function ColorPicker({ value = '#000000', onChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-8 h-8 rounded border">
          <div 
            className="w-full h-full rounded-sm" 
            style={{ backgroundColor: value }} 
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={value} onChange={onChange} />
        <HexColorInput 
          color={value} 
          onChange={onChange}
          className="mt-2 w-full px-2 py-1 border rounded text-sm"
          prefixed
        />
      </PopoverContent>
    </Popover>
  )
}
```

---

### 5.10 Form.Item ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 表单项 | shadcn Form (react-hook-form) |
| **使用文件** | 1 个 (enhancer) |  |
| **rules** | 校验规则 | zod schema |
| **labelCol/wrapperCol** | 栅格布局 | flex/grid 布局 |
| **validateStatus** | 校验状态 | 自动管理 |

#### 当前用法 (enhancer.tsx)

```tsx
<Form.Item
  style={{ ...style, margin: '0px' }}
  rules={required ? [{ required: true }] : undefined}
  labelCol={{ span: 11, style: { textAlign: 'left' } }}
  wrapperCol={{ span: 11, offset: 1, style: { textAlign: 'right' } }}
  label={label}
  labelAlign='left'
  validateStatus={meta.touched && meta.error ? 'error' : undefined}
  help={meta.touched && meta.error ? meta.error : helpText}
>
  {children}
</Form.Item>
```

#### 替代方案：shadcn Form

```tsx
// components/ui/form-item.tsx
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface EnhancedFormFieldProps {
  name: string
  label?: string
  required?: boolean
  helpText?: string
  layout?: 'vertical' | 'horizontal' | 'inline'
  children: React.ReactElement
}

export function EnhancedFormField({
  name,
  label,
  required,
  helpText,
  layout = 'vertical',
  children,
}: EnhancedFormFieldProps) {
  const layoutClasses = {
    vertical: 'flex flex-col gap-2',
    horizontal: 'grid grid-cols-[1fr_1fr] gap-4 items-center',
    inline: 'grid grid-cols-[auto_1fr] gap-4 items-center',
  }
  
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={layoutClasses[layout]}>
          {label && (
            <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <div>
            <FormControl>
              {React.cloneElement(children, { ...field })}
            </FormControl>
            {helpText && !fieldState.error && (
              <p className="text-sm text-muted-foreground mt-1">{helpText}</p>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

// 使用示例
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1, '必填'),
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  
  return (
    <Form {...form}>
      <EnhancedFormField name="email" label="邮箱" required layout="horizontal">
        <Input />
      </EnhancedFormField>
    </Form>
  )
}
```

---

## 六、反馈组件

### 6.1 Modal ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 对话框 | shadcn Dialog |
| **使用文件** | 2 个 |  |

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

<Dialog open={visible} onOpenChange={setVisible}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
    </DialogHeader>
    <div>内容</div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setVisible(false)}>取消</Button>
      <Button onClick={handleOk}>确定</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 6.2 Drawer ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 抽屉 | shadcn Sheet (vaul) |
| **使用文件** | 2 个 |  |

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

<Sheet open={visible} onOpenChange={setVisible}>
  <SheetContent side="left" className="w-[400px]">
    <SheetHeader>
      <SheetTitle>标题</SheetTitle>
    </SheetHeader>
    <div>内容</div>
  </SheetContent>
</Sheet>
```

---

### 6.3 Message ✅

| 属性 | 当前用法 | 替代方案 |
|------|----------|----------|
| **类型** | 全局消息 | Sonner toast |
| **使用文件** | 3 个 |  |

```tsx
// 安装 sonner
import { toast } from "sonner"

// 替换
// Message.error('错误') 
toast.error('错误')

// Message.warning('警告')
toast.warning('警告')

// Message.success('成功')
toast.success('成功')

// 在 layout 中添加 Toaster
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

---

### 6.4 Tooltip ✅

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>悬停我</TooltipTrigger>
    <TooltipContent>
      提示内容
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 6.5 Popover ✅

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger>点击打开</PopoverTrigger>
  <PopoverContent>
    弹出内容
  </PopoverContent>
</Popover>
```

---

### 6.6 Dropdown / Menu ✅

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">打开菜单</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => handleClick('item1')}>
      菜单项 1
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleClick('item2')}>
      菜单项 2
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 6.7 Spin 🔧

```tsx
// components/ui/spinner.tsx
import { Loader2 } from "lucide-react"

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} />
}

// 使用
{loading && <Spinner className="w-6 h-6" />}

// 或使用 shadcn Skeleton 做骨架屏
import { Skeleton } from "@/components/ui/skeleton"
<Skeleton className="w-full h-[200px]" />
```

---

## 七、其他组件

### 7.1 Button ✅

```tsx
import { Button } from "@/components/ui/button"

// type 映射
// primary -> default
// text -> ghost
// 自定义 -> variant

<Button variant="default">主要按钮</Button>
<Button variant="ghost">文字按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button size="sm">小按钮</Button>
<Button size="icon"><Plus /></Button>
```

---

### 7.2 Card ✅

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

---

### 7.3 Typography 🎨

```tsx
// 直接使用 Tailwind
<h1 className="text-2xl font-bold">标题</h1>
<p className="text-muted-foreground">描述文字</p>
<span className="text-sm text-destructive">错误提示</span>
```

---

### 7.4 ConfigProvider 🔧

| 功能 | 当前用法 | 替代方案 |
|------|----------|------|
| **locale** | enUS | 自建 Context + LinguiJS |
| **theme** | 未使用 | Tailwind CSS 变量 |

```tsx
// providers/locale-provider.tsx
'use client'

import { createContext, useContext } from 'react'

const LocaleContext = createContext<'en' | 'zh'>('en')

export function LocaleProvider({ 
  children, 
  locale 
}: { 
  children: React.ReactNode
  locale: 'en' | 'zh'
}) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
```

---

## 八、代码编辑器

### 8.1 CodeMirror 📦

当前项目使用 `codemirror@5` + `react-codemirror2`，建议升级到 CodeMirror 6：

```tsx
// 推荐: @uiw/react-codemirror
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'

<CodeMirror
  value={code}
  height="400px"
  extensions={[json()]}
  onChange={(value) => setCode(value)}
  theme="dark"
/>
```

---

## 九、迁移顺序建议

### 阶段 1：基础组件（第 1 周）
- [ ] Button
- [ ] Input / Textarea
- [ ] Select
- [ ] Checkbox / Radio
- [ ] Switch / Slider
- [ ] Tooltip / Popover

### 阶段 2：布局组件（第 2 周）
- [ ] Grid → Tailwind Grid
- [ ] Space → Flex gap
- [ ] Layout → Resizable

### 阶段 3：容器组件（第 2-3 周）
- [ ] Collapse → Accordion
- [ ] Tabs
- [ ] Card
- [ ] Modal → Dialog
- [ ] Drawer → Sheet

### 阶段 4：复杂组件（第 3-4 周）
- [ ] Tree → react-arborist
- [ ] TreeSelect → headless-tree
- [ ] Form.Item → react-hook-form

### 阶段 5：反馈组件（第 4 周）
- [ ] Message → Sonner
- [ ] Dropdown/Menu
- [ ] Spin → Spinner

### 阶段 6：样式统一（第 5 周）
- [ ] 移除所有 `.arco-*` CSS 覆盖
- [ ] 统一设计令牌
- [ ] 暗色主题适配

### 阶段 7：测试与修复（第 6 周）
- [ ] 功能回归测试
- [ ] 视觉还原检查
- [ ] 性能验证

---

## 十、注意事项

### 10.1 Server Components 兼容

以下组件需要 `'use client'` 指令：
- Dialog / Sheet
- Popover / Tooltip
- DropdownMenu
- Tabs（交互部分）
- Tree / TreeSelect
- Form（交互部分）
- Toast

### 10.2 样式迁移

1. 移除所有 `@arco-design/web-react` 的 CSS 导入
2. 移除所有 `.arco-*` 的样式覆盖
3. 统一使用 Tailwind CSS 变量

### 10.3 保持兼容

可以创建包装层在迁移期间保持 API 兼容：

```tsx
// components/compat/Grid.tsx
export { GridRow as Row, GridCol as Col } from '@/components/ui/grid'

// 使用时
import { Row, Col } from '@/components/compat/Grid'
// 与原 <Grid.Row><Grid.Col> 用法一致
```

---

## 十、Upload 组件

### 10.1 ImageUploader 🔧

当前项目的 ImageUploader 是自定义实现，使用了多个 Arco 组件：

```tsx
// 当前使用的 Arco 组件
import {
  Button,
  Dropdown,
  Grid,
  Input,
  Menu,
  Message,
  Modal,
  Popover,
  Space,
  Spin,
} from '@arco-design/web-react'
```

#### 替代方案

保持自定义实现，替换内部使用的 Arco 组件为 shadcn 对应组件：

```tsx
// components/image-uploader/index.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Spin 替换为
{loading && <Loader2 className="animate-spin" />}

// Message.error 替换为
toast.error('上传失败')

// Modal 替换为 Dialog
<Dialog open={previewVisible} onOpenChange={setPreviewVisible}>
  <DialogContent>
    <img src={previewUrl} alt="preview" />
  </DialogContent>
</Dialog>
```

---

## 十一、Help 组件

### 11.1 Tooltip 帮助提示

```tsx
// 当前
import { Tooltip, TooltipProps } from '@arco-design/web-react'

<Tooltip content={helpText}>
  <IconQuestionCircle />
</Tooltip>

// 替换为
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <HelpCircle className="w-4 h-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>{helpText}</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 十二、类型导入处理

### 12.1 需要替换的类型

| Arco 类型 | 替代方案 |
|-----------|----------|
| `PopoverProps` | `React.ComponentProps<typeof Popover>` |
| `TooltipProps` | `React.ComponentProps<typeof Tooltip>` |
| `TabsProps` | `React.ComponentProps<typeof Tabs>` |
| `InputProps` | `React.ComponentProps<typeof Input>` |
| `SelectProps` | `React.ComponentProps<typeof Select>` |
| `FormItemProps` | 自定义或使用 react-hook-form 类型 |
| `TreeProps` | `TreeApi` from react-arborist |
| `AllowDrop` | 自定义类型 |
| `NodeInstance` | `NodeApi` from react-arborist |

### 12.2 类型定义示例

```tsx
// types/components.ts

// Tree 相关
import type { NodeApi, TreeApi } from 'react-arborist'

export type AllowDropFn<T> = (args: {
  parentNode: NodeApi<T> | null
  dragNodes: NodeApi<T>[]
  index: number
}) => boolean

// Popover 相关
import type { PopoverProps as RadixPopoverProps } from '@radix-ui/react-popover'
export type PopoverProps = RadixPopoverProps & {
  // 扩展属性
}
```

---

## 十三、快速参考表

### 所有组件一览

| Arco 组件 | 替代方案 | 类型 | 使用文件数 | 迁移优先级 |
|-----------|----------|------|-----------|-----------|
| Button | shadcn Button | ✅ | 14 | P1 |
| Input | shadcn Input | ✅ | 9 | P1 |
| Input.TextArea | shadcn Textarea | ✅ | 3 | P1 |
| Input.Search | 自定义 SearchInput | 🔧 | 1 | P2 |
| InputNumber | 自定义 InputNumber | 🔧 | 1 | P2 |
| Select | shadcn Select | ✅ | 1 | P1 |
| TreeSelect | headless-tree + Popover | 📦 | 2 | P3 |
| AutoComplete | cmdk + Popover | 📦 | 1 | P3 |
| Checkbox | shadcn Checkbox | ✅ | 1 | P1 |
| Radio.Group | shadcn RadioGroup | ✅ | 1 | P1 |
| Switch | shadcn Switch | ✅ | 4 | P1 |
| Slider | shadcn Slider | ✅ | 1 | P1 |
| Tree | react-arborist | 📦 | 2 | P3 |
| Grid.Row/Col | Tailwind Grid | 🎨 | 26 | P1 |
| Space | Tailwind Flex | 🎨 | 24 | P1 |
| Layout/Sider | shadcn Resizable | ✅ | 3 | P2 |
| Collapse | shadcn Accordion | ✅ | 25 | P1 |
| Tabs | shadcn Tabs | ✅ | 5 | P1 |
| Card | shadcn Card | ✅ | 4 | P1 |
| Modal | shadcn Dialog | ✅ | 2 | P1 |
| Drawer | shadcn Sheet | ✅ | 2 | P1 |
| Tooltip | shadcn Tooltip | ✅ | 13 | P1 |
| Popover | shadcn Popover | ✅ | 9 | P1 |
| Dropdown/Menu | shadcn DropdownMenu | ✅ | 4 | P1 |
| Message | Sonner toast | ✅ | 3 | P1 |
| Spin | Loader2 icon | 🔧 | 1 | P2 |
| List | 自定义 List | 🔧 | 1 | P2 |
| Typography | Tailwind classes | 🎨 | 2 | P1 |
| ConfigProvider | 自定义 Context | 🔧 | 2 | P2 |
| Form.Item | shadcn Form | ✅ | 1 | P2 |

**图例**：✅ shadcn 原生 | 📦 第三方库 | 🔧 需自定义 | 🎨 仅 Tailwind

**优先级**：P1 (高) → P3 (低)

---

## 十四、附录

### A. 完整依赖安装命令

```bash
# 1. 安装 Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 2. 安装 shadcn CLI 并初始化
npx shadcn@latest init

# 3. 添加 shadcn 组件
npx shadcn@latest add button input textarea select checkbox radio-group switch slider
npx shadcn@latest add dialog sheet tabs accordion tooltip popover dropdown-menu
npx shadcn@latest add form label card sonner command

# 4. 安装第三方组件
pnpm add react-arborist @headless-tree/core @headless-tree/react
pnpm add react-colorful @tanstack/react-virtual
pnpm add @uiw/react-codemirror @codemirror/lang-json @codemirror/lang-html

# 5. 安装表单相关
pnpm add react-hook-form @hookform/resolvers zod
```

### B. Tailwind 配置扩展

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
    }
  }
}
```

### C. 文件清单

需要修改的文件数统计：
- Grid 相关：26 个文件
- Collapse 相关：25 个文件
- Space 相关：24 个文件
- Button 相关：14 个文件
- Tooltip 相关：13 个文件
- 其他：约 30 个文件

**总计：约 67 个文件需要修改**

### D. 迁移辅助脚本

```javascript
// scripts/check-arco-usage.mjs
// 检查 Arco 组件使用情况

import * as fs from 'fs'
import * as path from 'path'

const extensionsDir = './packages/email-editor-extensions/src'

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      getAllFiles(fullPath, files)
    } else if (item.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}

const arcoComponents = [
  'Button', 'Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Slider',
  'InputNumber', 'AutoComplete', 'TreeSelect', 'Tree',
  'Grid', 'Space', 'Layout', 'Collapse', 'Tabs', 'Card',
  'Modal', 'Drawer', 'Tooltip', 'Popover', 'Dropdown', 'Menu',
  'Message', 'Spin', 'List', 'Typography', 'Form', 'ConfigProvider'
]

const usage = {}
arcoComponents.forEach(c => usage[c] = [])

const files = getAllFiles(extensionsDir)

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8')
  if (!content.includes('@arco-design/web-react')) continue
  
  for (const component of arcoComponents) {
    const regex = new RegExp(`\\b${component}\\b`, 'g')
    if (regex.test(content)) {
      usage[component].push(file)
    }
  }
}

console.log('Arco 组件使用统计:\n')
for (const [component, files] of Object.entries(usage)) {
  if (files.length > 0) {
    console.log(`${component}: ${files.length} 个文件`)
  }
}
```

### E. 完整文件清单

以下文件需要修改（按目录分组）：

**AttributePanel/components/blocks/** (15 文件)
- Accordion/index.tsx
- AccordionElement/index.tsx
- AccordionText/index.tsx
- AccordionTitle/index.tsx
- AdvancedTable/index.tsx
- Button/index.tsx
- Carousel/index.tsx
- Column/index.tsx
- Divider/index.tsx
- Group/index.tsx
- Hero/index.tsx
- Image/index.tsx
- Navbar/index.tsx
- Page/index.tsx
- Raw/index.tsx
- Section/index.tsx
- Social/index.tsx
- Spacer/index.tsx
- Table/index.tsx
- Text/index.tsx
- Wrapper/index.tsx

**AttributePanel/components/attributes/** (8 文件)
- Background.tsx
- Border.tsx
- CollapseWrapper/index.tsx
- Condition.tsx
- Iteration.tsx
- Link.tsx
- MergeTags.tsx
- Padding.tsx

**components/Form/** (15 文件)
- AddFont.tsx
- AutoComplete.tsx
- CheckBoxGroup.tsx
- ColorPicker/index.tsx
- ColorPicker2.tsx
- ColorPicker/ColorPickerContent.tsx
- EditGridTab.tsx
- EditTab.tsx
- enhancer.tsx
- ImageUploader/index.tsx
- index.tsx
- Input.tsx
- InputWithUnit.tsx
- RadioGroup.tsx
- Select.tsx
- UploadField.tsx

**components/Form/RichTextToolBar/** (10 文件)
- components/Bold/index.tsx
- components/FontFamily/index.tsx
- components/FontSize/index.tsx
- components/Heading/index.tsx
- components/Italic/index.tsx
- components/Link/index.tsx
- components/MergeTags/index.tsx
- components/StrikeThrough/index.tsx
- components/ToolItem/index.tsx
- components/Underline/index.tsx
- components/Unlink/index.tsx

**其他** (19 文件)
- BlockLayer/index.tsx
- BlockLayer/components/BlockTree/index.tsx
- ConfigurationPanel/index.tsx
- EditPanel/index.tsx
- EditPanel/Blocks/index.tsx
- EditPanel/ConfigurationDrawer/index.tsx
- ShortcutToolbar/components/BlocksPanel/index.tsx
- ShortcutToolbar/components/DragIcon/index.tsx
- SimpleLayout/SimpleLayout.tsx
- SourceCodePanel/index.tsx
- StandardLayout/StandardLayout.tsx
- components/AddToCollection/index.tsx
- AttributePanel/components/UI/Help/index.tsx
- AttributePanel/components/UI/HtmlEditor.tsx
- AttributePanel/components/blocks/AdvancedTable/Operation/tableCellBgSelector.tsx
