import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { cn } from '../../lib/utils'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface TreeSelectDataNode {
  key?: string
  value?: string
  title?: React.ReactNode
  children?: TreeSelectDataNode[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  isLeaf?: boolean
}

export interface TreeSelectProps {
  value?: string | string[]
  defaultValue?: string | string[]
  treeData?: TreeSelectDataNode[]
  fieldNames?: { key?: string; title?: string; children?: string }
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  allowClear?: boolean
  showSearch?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  treeCheckStrictly?: boolean
  treeDefaultExpandAll?: boolean
  treeDefaultExpandedKeys?: string[]
  labelInValue?: boolean
  maxTagCount?: number
  size?: 'mini' | 'small' | 'default' | 'large'
  bordered?: boolean
  error?: boolean
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuClassName?: string
  getPopupContainer?: () => HTMLElement
  filterTreeNode?: boolean | ((inputValue: string, treeNode: TreeSelectDataNode) => boolean)
  onChange?: (value: string | string[]) => void
  onSearch?: (inputValue: string) => void
  onClear?: () => void
  className?: string
  style?: React.CSSProperties
}

interface FlatNode {
  key: string
  title: React.ReactNode
  value: string
  depth: number
  hasChildren: boolean
  disabled?: boolean
}

function flattenTree(
  nodes: TreeSelectDataNode[],
  depth = 0,
  result: FlatNode[] = []
): FlatNode[] {
  for (const node of nodes) {
    const key = node.key || node.value || ''
    result.push({
      key,
      title: node.title,
      value: node.value || key,
      depth,
      hasChildren: !!(node.children && node.children.length > 0),
      disabled: node.disabled,
    })
    if (node.children) {
      flattenTree(node.children, depth + 1, result)
    }
  }
  return result
}

export const TreeSelect: React.FC<TreeSelectProps> = ({
  value,
  defaultValue,
  treeData = [],
  placeholder = 'Select...',
  disabled,
  loading,
  size = 'default',
  error,
  onChange,
  className,
  style,
}) => {
  const flatNodes = React.useMemo(() => flattenTree(treeData), [treeData])

  const handleChange = (newValue: string) => {
    onChange?.(newValue)
  }

  const sizeClasses = {
    mini: 'h-6',
    small: 'h-8',
    default: 'h-10',
    large: 'h-12',
  }

  return (
    <Select
      value={Array.isArray(value) ? value[0] : value}
      defaultValue={Array.isArray(defaultValue) ? defaultValue[0] : defaultValue}
      onValueChange={handleChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={cn(
          sizeClasses[size],
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        style={style}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {flatNodes.map((node) => (
          <SelectItem
            key={node.key}
            value={node.value}
            disabled={node.disabled}
            className={cn('cursor-pointer')}
          >
            <div
              className="flex items-center"
              style={{ paddingLeft: `${node.depth * 16}px` }}
            >
              {node.hasChildren && (
                <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
              )}
              {node.title}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

TreeSelect.displayName = 'TreeSelect'

export default TreeSelect
