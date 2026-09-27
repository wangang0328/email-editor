import * as React from 'react'
import { cn } from '../../lib/utils'

type ListSize = 'small' | 'default' | 'large'

export interface ListProps<T = unknown> {
  dataSource?: T[]
  render?: (item: T, index: number) => React.ReactNode
  renderItem?: (item: T, index: number) => React.ReactNode
  size?: ListSize
  header?: React.ReactNode
  footer?: React.ReactNode
  bordered?: boolean
  split?: boolean
  loading?: boolean
  hoverable?: boolean
  pagination?: boolean | Record<string, unknown>
  grid?: { gutter?: number; span?: number; xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number }
  noDataElement?: React.ReactNode
  scrollLoading?: React.ReactNode
  offsetBottom?: number
  throttleDelay?: number
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
  onReachBottom?: () => void
  onListScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface ListItemProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  actions?: React.ReactNode[]
  extra?: React.ReactNode
}

export interface ListItemMetaProps {
  className?: string
  style?: React.CSSProperties
  avatar?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
}

const sizeClasses: Record<ListSize, string> = {
  small: 'py-2 px-3',
  default: 'py-3 px-4',
  large: 'py-4 px-5',
}

export function List<T = unknown>({
  dataSource = [],
  render,
  renderItem,
  size = 'default',
  header,
  footer,
  bordered = false,
  split = true,
  loading,
  hoverable,
  noDataElement,
  className,
  style,
  children,
}: ListProps<T>) {
  const renderFunc = render || renderItem

  return (
    <div
      className={cn(
        'bg-background',
        bordered && 'border rounded-lg',
        className
      )}
      style={style}
    >
      {header && (
        <div className={cn('border-b', sizeClasses[size])}>
          {header}
        </div>
      )}

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : dataSource.length === 0 && !children ? (
          <div className="flex items-center justify-center py-8">
            {noDataElement || <span className="text-muted-foreground">No data</span>}
          </div>
        ) : (
          <>
            {children}
            {renderFunc && dataSource.map((item, index) => (
              <div
                key={index}
                className={cn(
                  split && index < dataSource.length - 1 && 'border-b',
                  hoverable && 'hover:bg-muted transition-colors'
                )}
              >
                {renderFunc(item, index)}
              </div>
            ))}
          </>
        )}
      </div>

      {footer && (
        <div className={cn('border-t', sizeClasses[size])}>
          {footer}
        </div>
      )}
    </div>
  )
}

export const ListItem: React.FC<ListItemProps> = ({
  className,
  style,
  children,
  actions,
  extra,
}) => {
  return (
    <div
      className={cn('flex items-center justify-between py-3 px-4', className)}
      style={style}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {extra && <div className="ml-4 flex-shrink-0">{extra}</div>}
      {actions && actions.length > 0 && (
        <div className="ml-4 flex items-center gap-2">
          {actions.map((action, index) => (
            <span key={index}>{action}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export const ListItemMeta: React.FC<ListItemMetaProps> = ({
  className,
  style,
  avatar,
  title,
  description,
}) => {
  return (
    <div className={cn('flex items-start gap-3', className)} style={style}>
      {avatar && <div className="flex-shrink-0">{avatar}</div>}
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium">{title}</div>}
        {description && (
          <div className="text-sm text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
    </div>
  )
}

const ListItemWithMeta = ListItem as typeof ListItem & { Meta: typeof ListItemMeta }
ListItemWithMeta.Meta = ListItemMeta
List.Item = ListItemWithMeta

List.displayName = 'List'
ListItem.displayName = 'List.Item'
ListItemMeta.displayName = 'List.Item.Meta'

export default List
