import * as React from 'react'
import { cn } from '../../lib/utils'

type SpaceSize = 'mini' | 'small' | 'medium' | 'large' | number
type SpaceAlign = 'start' | 'end' | 'center' | 'baseline'

export interface SpaceProps {
  align?: SpaceAlign
  direction?: 'vertical' | 'horizontal'
  size?: SpaceSize | [SpaceSize, SpaceSize]
  wrap?: boolean
  split?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const sizeValues: Record<string, number> = {
  mini: 4,
  small: 8,
  medium: 16,
  large: 24,
}

const alignValues: Record<SpaceAlign, React.CSSProperties['alignItems']> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
}

export const Space: React.FC<SpaceProps> = ({
  align = 'center',
  direction = 'horizontal',
  size = 'small',
  wrap = false,
  split,
  className,
  style,
  children,
}) => {
  const childArray = React.Children.toArray(children).filter(Boolean)

  const getGapValue = (): number | undefined => {
    if (typeof size === 'number') {
      return size
    }
    if (Array.isArray(size)) {
      return undefined
    }
    return sizeValues[size] || 8
  }

  const getGapStyle = (): React.CSSProperties => {
    if (Array.isArray(size)) {
      const [horizontal, vertical] = size
      return {
        columnGap: typeof horizontal === 'number' ? horizontal : sizeValues[horizontal] || 8,
        rowGap: typeof vertical === 'number' ? vertical : sizeValues[vertical] || 8,
      }
    }
    const gapValue = getGapValue()
    return gapValue ? { gap: gapValue } : {}
  }

  const spaceStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: alignValues[align],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...getGapStyle(),
    ...style,
  }

  return (
    <div className={cn(className)} style={spaceStyle}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {split && index < childArray.length - 1 && (
            <span style={{ flexShrink: 0 }}>{split}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

Space.displayName = 'Space'

export default Space
