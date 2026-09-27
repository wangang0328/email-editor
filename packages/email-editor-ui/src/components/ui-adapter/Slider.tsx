import * as React from 'react'
import { Slider as ShadcnSlider } from '../ui/slider'
import { cn } from '../../lib/utils'

export interface SliderProps {
  value?: number | [number, number]
  defaultValue?: number | [number, number]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  range?: boolean
  vertical?: boolean
  reverse?: boolean
  marks?: Record<number, React.ReactNode>
  showTicks?: boolean
  showInput?: boolean
  onlyMarkValue?: boolean
  formatTooltip?: (value: number) => string | number
  getTooltipContainer?: () => HTMLElement
  onChange?: (value: number | [number, number]) => void
  onAfterChange?: (value: number | [number, number]) => void
  className?: string
  style?: React.CSSProperties
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      range,
      vertical,
      onChange,
      onAfterChange,
      className,
      style,
    },
    ref
  ) => {
    const normalizeValue = (val: number | [number, number] | undefined): number[] | undefined => {
      if (val === undefined) return undefined
      if (Array.isArray(val)) return val
      return [val]
    }

    const handleValueChange = (newValue: number[]) => {
      const outputValue = range ? (newValue as [number, number]) : newValue[0]
      onChange?.(outputValue)
    }

    const handleValueCommit = (newValue: number[]) => {
      const outputValue = range ? (newValue as [number, number]) : newValue[0]
      onAfterChange?.(outputValue)
    }

    return (
      <ShadcnSlider
        ref={ref}
        value={normalizeValue(value)}
        defaultValue={normalizeValue(defaultValue) || [min]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={vertical ? 'vertical' : 'horizontal'}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className={cn(
          vertical && 'h-full w-2',
          className
        )}
        style={style}
      />
    )
  }
)

Slider.displayName = 'Slider'

export default Slider
