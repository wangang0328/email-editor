import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

type SpinSize = 'small' | 'default' | 'large'

export interface SpinProps {
  loading?: boolean
  size?: SpinSize
  icon?: React.ReactNode
  element?: React.ReactNode
  tip?: string
  dot?: boolean
  delay?: number
  block?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const sizeClasses: Record<SpinSize, string> = {
  small: 'h-4 w-4',
  default: 'h-6 w-6',
  large: 'h-8 w-8',
}

export const Spin: React.FC<SpinProps> = ({
  loading = true,
  size = 'default',
  icon,
  element,
  tip,
  block,
  className,
  style,
  children,
}) => {
  const spinner = element || icon || (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
  )

  if (children) {
    return (
      <div className={cn('relative', className)} style={style}>
        {children}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            {spinner}
            {tip && <span className="mt-2 text-sm text-muted-foreground">{tip}</span>}
          </div>
        )}
      </div>
    )
  }

  if (!loading) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        block && 'w-full',
        className
      )}
      style={style}
    >
      {spinner}
      {tip && <span className="mt-2 text-sm text-muted-foreground">{tip}</span>}
    </div>
  )
}

Spin.displayName = 'Spin'

export default Spin
