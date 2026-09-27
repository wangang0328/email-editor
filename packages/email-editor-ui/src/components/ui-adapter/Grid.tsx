import * as React from 'react'
import { cn } from '../../lib/utils'

type Gutter = number | [number, number]
type ColSpan = number

const GridContext = React.createContext<{ gutter: number }>({ gutter: 0 })

export interface RowProps {
  gutter?: Gutter
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'space-around' | 'space-between'
  wrap?: boolean
  div?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const alignStyleMapping: Record<string, React.CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

const justifyStyleMapping: Record<string, React.CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-around': 'space-around',
  'space-between': 'space-between',
}

export const Row: React.FC<RowProps> = ({
  gutter = 0,
  align = 'start',
  justify = 'start',
  wrap = true,
  div,
  className,
  style,
  children,
}) => {
  const [horizontalGutter, verticalGutter] = Array.isArray(gutter)
    ? gutter
    : [gutter, gutter]

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    alignItems: alignStyleMapping[align],
    justifyContent: justifyStyleMapping[justify],
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    marginLeft: horizontalGutter ? -horizontalGutter / 2 : undefined,
    marginRight: horizontalGutter ? -horizontalGutter / 2 : undefined,
    rowGap: verticalGutter || undefined,
    ...style,
  }

  const contextValue = React.useMemo(
    () => ({ gutter: horizontalGutter }),
    [horizontalGutter]
  )

  return (
    <GridContext.Provider value={contextValue}>
      <div className={cn(className)} style={rowStyle}>
        {children}
      </div>
    </GridContext.Provider>
  )
}

Row.displayName = 'Row'

export interface ColProps {
  span?: ColSpan
  offset?: number
  order?: number
  push?: number
  pull?: number
  xs?: ColSpan | { span?: ColSpan; offset?: number }
  sm?: ColSpan | { span?: ColSpan; offset?: number }
  md?: ColSpan | { span?: ColSpan; offset?: number }
  lg?: ColSpan | { span?: ColSpan; offset?: number }
  xl?: ColSpan | { span?: ColSpan; offset?: number }
  xxl?: ColSpan | { span?: ColSpan; offset?: number }
  flex?: number | string | 'auto' | 'none'
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Col: React.FC<ColProps> = ({
  span,
  offset,
  order,
  flex,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  className,
  style,
  children,
}) => {
  const { gutter } = React.useContext(GridContext)

  const spanPercent = span !== undefined ? (span / 24) * 100 : undefined
  const offsetPercent = offset !== undefined ? (offset / 24) * 100 : undefined

  const colStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    minWidth: 0,
    paddingLeft: gutter ? gutter / 2 : undefined,
    paddingRight: gutter ? gutter / 2 : undefined,
    order,
    flex: flex !== undefined 
      ? (flex === 'auto' ? '1 1 auto' : flex === 'none' ? '0 0 auto' : typeof flex === 'number' ? `${flex} ${flex} auto` : flex) 
      : undefined,
    width: spanPercent !== undefined ? `${spanPercent}%` : undefined,
    marginLeft: offsetPercent !== undefined ? `${offsetPercent}%` : undefined,
    ...style,
  }

  return (
    <div className={cn(className)} style={colStyle}>
      {children}
    </div>
  )
}

Col.displayName = 'Col'

const Grid = {
  Row,
  Col,
}

export default Grid
