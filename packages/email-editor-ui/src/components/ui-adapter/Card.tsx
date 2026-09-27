import * as React from 'react'
import { cn } from '../../lib/utils'

type CardSize = 'default' | 'small'

export interface CardProps {
  id?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  title?: React.ReactNode
  extra?: React.ReactNode
  cover?: React.ReactNode
  actions?: React.ReactNode[]
  size?: CardSize
  bordered?: boolean
  loading?: boolean
  hoverable?: boolean
  headerStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
}

export const Card: React.FC<CardProps> & {
  Meta: React.FC<CardMetaProps>
  Grid: React.FC<CardGridProps>
} = ({
  className,
  style,
  children,
  title,
  extra,
  cover,
  actions,
  size = 'default',
  bordered = true,
  loading,
  hoverable,
  headerStyle,
  bodyStyle,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-card text-card-foreground',
        bordered && 'border',
        hoverable && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
      style={style}
    >
      {cover && <div className="overflow-hidden rounded-t-lg">{cover}</div>}
      
      {(title || extra) && (
        <div
          className={cn(
            'flex items-center justify-between border-b',
            size === 'small' ? 'px-3 py-2' : 'px-4 py-3'
          )}
          style={headerStyle}
        >
          {title && (
            <div className="font-medium">{title}</div>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      
      <div
        className={cn(
          size === 'small' ? 'p-3' : 'p-4',
          loading && 'animate-pulse'
        )}
        style={bodyStyle}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex border-t divide-x">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex-1 py-2 text-center cursor-pointer hover:bg-muted transition-colors"
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export interface CardMetaProps {
  className?: string
  style?: React.CSSProperties
  avatar?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
}

const CardMeta: React.FC<CardMetaProps> = ({
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
        {title && <div className="font-medium truncate">{title}</div>}
        {description && (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        )}
      </div>
    </div>
  )
}

export interface CardGridProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  hoverable?: boolean
}

const CardGrid: React.FC<CardGridProps> = ({
  className,
  style,
  children,
  hoverable,
}) => {
  return (
    <div
      className={cn(
        'border-b border-r p-4',
        hoverable && 'hover:shadow-md cursor-pointer transition-shadow',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

Card.Meta = CardMeta
Card.Grid = CardGrid

Card.displayName = 'Card'
CardMeta.displayName = 'Card.Meta'
CardGrid.displayName = 'Card.Grid'

export default Card
