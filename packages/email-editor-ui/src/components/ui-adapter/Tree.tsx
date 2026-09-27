import * as React from 'react'
import {
  Tree as ArboristTree,
  type MoveHandler,
  type NodeRendererProps,
  type NodeApi,
} from 'react-arborist'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'

/** BlockTree 拖拽等逻辑沿用的 Arco Tree 节点句柄 */
export interface NodeInstance {
  props: {
    _key?: string
    parentKey?: string
    dataRef?: unknown
    parent?: unknown
    [key: string]: unknown
  }
}

export type AllowDrop = (option: {
  dropNode: NodeInstance
  dropPosition: number
}) => boolean

export interface TreeDataNode {
  key: string
  title: React.ReactNode
  children?: TreeDataNode[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  isLeaf?: boolean
  icon?: React.ReactNode
  [key: string]: unknown
}

/** BlockLayer / BlockTree drop payload (react-arborist controlled move). */
export interface BlockTreeDropInfo {
  dragNode: {
    dataRef: TreeDataNode
    key: string
    parentKey: string
    parent: TreeDataNode | null
  }
  dropNode: {
    dataRef: TreeDataNode
    key: string
    parentKey: string
    parent: TreeDataNode | null
  }
  /** Target index under `dropNode` (parent). */
  dropPosition: number
}

export interface TreeProps {
  treeData?: TreeDataNode[]
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  expandedKeys?: string[]
  defaultExpandedKeys?: string[]
  checkedKeys?: string[]
  defaultCheckedKeys?: string[]
  checkable?: boolean
  selectable?: boolean
  multiple?: boolean
  draggable?: boolean
  blockNode?: boolean
  showLine?: boolean
  autoExpandParent?: boolean
  defaultExpandAll?: boolean
  size?: 'mini' | 'small' | 'default' | 'large'
  virtualListProps?: { height?: number }
  fieldNames?: { key?: string; title?: string; children?: string }
  renderTitle?: (node: TreeDataNode) => React.ReactNode
  renderExtra?: (node: TreeDataNode) => React.ReactNode
  icons?: {
    switcherIcon?: React.ReactNode
    dragIcon?: React.ReactNode
  }
  onSelect?: (
    selectedKeys: string[],
    extra?: { selected: boolean; node: TreeDataNode }
  ) => void
  onCheck?: (checkedKeys: string[], extra: { checked: boolean; node: TreeDataNode }) => void
  onExpand?: (
    expandedKeys: string[],
    extra?: { expanded: boolean; node: TreeDataNode }
  ) => void
  onDragStart?: (e: React.DragEvent<HTMLSpanElement>, node: NodeInstance) => void
  onDragEnd?: () => void
  allowDrop?: AllowDrop
  /** Full drop validation (drag + target). Preferred for BlockLayer. */
  canDrop?: (o: {
    dragNode: { type: string } | { key: string }
    dropNode: { dataRef: TreeDataNode; parent: TreeDataNode | null; key: string }
    dropPosition: number
  }) => false | { key: string; position: number }
  onDrop?: (info: BlockTreeDropInfo) => void
  className?: string
  style?: React.CSSProperties
}

interface ArboristNode {
  id: string
  name: string
  children?: ArboristNode[]
  data: TreeDataNode
}

function getNodeId(
  node: TreeDataNode,
  fieldNames?: { key?: string; title?: string; children?: string }
): string {
  const keyField = fieldNames?.key || 'key'
  return String(
    (node as Record<string, unknown>)[keyField] ||
      node.key ||
      (node as Record<string, unknown>).id ||
      ''
  )
}

function getNodeChildren(
  node: TreeDataNode,
  fieldNames?: { key?: string; title?: string; children?: string }
): TreeDataNode[] | undefined {
  const childrenField = fieldNames?.children || 'children'
  return (node as Record<string, unknown>)[childrenField] as TreeDataNode[] | undefined
}

const convertToArboristData = (
  nodes: TreeDataNode[],
  fieldNames?: { key?: string; title?: string; children?: string }
): ArboristNode[] => {
  const titleField = fieldNames?.title || 'title'

  return nodes.map((node) => {
    const nodeKey = getNodeId(node, fieldNames)
    const nodeTitle = (node as Record<string, unknown>)[titleField] || node.title
    const nodeChildren = getNodeChildren(node, fieldNames)

    return {
      id: nodeKey,
      name: typeof nodeTitle === 'string' ? nodeTitle : nodeKey,
      children: nodeChildren ? convertToArboristData(nodeChildren, fieldNames) : undefined,
      data: node,
    }
  })
}

interface NodeRendererContext {
  renderTitle?: (node: TreeDataNode) => React.ReactNode
  onDragStart?: TreeProps['onDragStart']
}

const NodeRendererContext = React.createContext<NodeRendererContext>({})

const DefaultNode = ({ node, style, dragHandle }: NodeRendererProps<ArboristNode>) => {
  const data = node.data.data
  const isExpanded = node.isOpen
  const { renderTitle, onDragStart } = React.useContext(NodeRendererContext)

  const titleContent = renderTitle ? renderTitle(data) : data.title

  return (
    <div
      style={style}
      ref={dragHandle}
      className={cn(
        EDITOR_CLASS.treeNodeTitle,
        'flex items-center gap-1 px-1 py-0.5 cursor-pointer rounded',
        node.isSelected && EDITOR_CLASS.treeNodeSelected,
        node.isInternal && node.isOpen && EDITOR_CLASS.treeNodeExpanded,
        node.isSelected && 'bg-primary/10 text-primary',
        'hover:bg-muted'
      )}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        onDragStart?.(e as unknown as React.DragEvent<HTMLSpanElement>, {
          props: {
            _key: node.id,
            parentKey: node.parent?.id,
            dataRef: data,
            parent: (data as TreeDataNode & { parent?: TreeDataNode }).parent,
          },
        })
      }}
      onClick={() => node.isInternal && node.toggle()}
    >
      {node.isInternal ? (
        <span
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            node.toggle()
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <span className="flex-1 truncate text-sm">{titleContent}</span>
    </div>
  )
}

export const Tree: React.FC<TreeProps> = ({
  treeData = [],
  selectedKeys,
  defaultSelectedKeys,
  draggable = false,
  virtualListProps,
  fieldNames,
  renderTitle,
  onSelect,
  onDrop,
  onDragStart,
  onDragEnd,
  allowDrop,
  canDrop,
  className,
  style,
}) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const [autoHeight, setAutoHeight] = React.useState(1)

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const update = () => {
      const next = Math.floor(el.getBoundingClientRect().height)
      if (next > 0) {
        setAutoHeight(next)
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const arboristData = React.useMemo(
    () => convertToArboristData(treeData, fieldNames),
    [treeData, fieldNames]
  )

  const [selection, setSelection] = React.useState<string | undefined>(
    selectedKeys?.[0] || defaultSelectedKeys?.[0]
  )

  React.useEffect(() => {
    if (selectedKeys !== undefined) {
      setSelection(selectedKeys[0])
    }
  }, [selectedKeys])

  const handleSelect = (nodes: NodeApi<ArboristNode>[]) => {
    const keys = nodes.map((n) => n.id)
    setSelection(keys[0])
    if (onSelect && nodes.length > 0) {
      onSelect(keys, { selected: true, node: nodes[0].data.data })
    }
  }

  const handleMove = React.useCallback<MoveHandler<ArboristNode>>(
    ({ dragNodes, parentId, parentNode, index }) => {
      if (!onDrop || dragNodes.length === 0 || !parentNode || parentId == null) {
        requestAnimationFrame(() => onDragEnd?.())
        return
      }

      const dragApi = dragNodes[0]
      const dragData = dragApi.data.data
      const dropData = parentNode.data.data
      const dragRecord = dragData as TreeDataNode & { parent?: TreeDataNode | null }
      const dropRecord = dropData as TreeDataNode & { parent?: TreeDataNode | null }

      onDrop({
        dragNode: {
          dataRef: dragData,
          key: dragApi.id,
          parentKey: dragApi.parent?.id ?? '',
          parent: dragRecord.parent ?? null,
        },
        dropNode: {
          dataRef: dropData,
          key: parentId,
          parentKey: dropRecord.parent
            ? getNodeId(dropRecord.parent, fieldNames)
            : '',
          parent: dropRecord.parent ?? null,
        },
        dropPosition: index,
      })

      requestAnimationFrame(() => onDragEnd?.())
    },
    [fieldNames, onDragEnd, onDrop]
  )

  const treeStructureKey = React.useMemo(() => {
    const walk = (nodes: ArboristNode[]): string =>
      nodes
        .map((node) => `${node.id}:${node.children ? walk(node.children) : ''}`)
        .join('|')
    return walk(arboristData)
  }, [arboristData])

  const disableDrop = React.useCallback(
    ({
      parentNode,
      dragNodes,
      index,
    }: {
      parentNode: NodeApi<ArboristNode>
      dragNodes: NodeApi<ArboristNode>[]
      index: number
    }) => {
      if (dragNodes.length === 0) {
        return true
      }

      const parentData = parentNode.data.data
      const parentRecord = parentData as TreeDataNode & { parent?: TreeDataNode | null }

      if (canDrop) {
        const result = canDrop({
          dragNode: { key: dragNodes[0].id },
          dropNode: {
            dataRef: parentData,
            parent: parentRecord.parent ?? null,
            key: parentNode.id,
          },
          dropPosition: index,
        })
        return result === false
      }

      if (!allowDrop) {
        return false
      }

      const allowed = allowDrop({
        dropNode: {
          props: {
            _key: parentNode.id,
            dataRef: parentData,
            parent: parentRecord.parent,
          },
        },
        dropPosition: index,
      })

      return !allowed
    },
    [allowDrop, canDrop]
  )

  const contextValue = React.useMemo(
    () => ({ renderTitle, onDragStart }),
    [renderTitle, onDragStart]
  )

  return (
    <NodeRendererContext.Provider value={contextValue}>
      <div
        ref={hostRef}
        className={cn('h-full min-h-0 w-full overflow-hidden', className)}
        style={{ maxHeight: '100%', ...style }}
      >
        <ArboristTree
          key={treeStructureKey}
          data={arboristData}
          selection={selection}
          onSelect={handleSelect}
          onMove={draggable ? handleMove : undefined}
          disableDrag={!draggable}
          disableDrop={draggable ? disableDrop : true}
          height={Math.max(virtualListProps?.height || autoHeight, 1)}
          width="100%"
          indent={20}
          rowHeight={28}
          openByDefault
        >
          {DefaultNode}
        </ArboristTree>
      </div>
    </NodeRendererContext.Provider>
  )
}

Tree.displayName = 'Tree'

export default Tree
