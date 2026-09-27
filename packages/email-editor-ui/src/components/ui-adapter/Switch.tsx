import * as React from 'react'
import { Switch as ShadcnSwitch } from '../ui/switch'
import { cn } from '../../lib/utils'

type SwitchSize = 'small' | 'default'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  size?: SwitchSize
  type?: 'circle' | 'round' | 'line'
  checkedText?: React.ReactNode
  uncheckedText?: React.ReactNode
  /** 将 checkedText / uncheckedText 显示在开关轨道内 */
  textInside?: boolean
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
  onChange?: (checked: boolean, e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      loading,
      size = 'default',
      checkedText,
      uncheckedText,
      textInside,
      onChange,
      className,
      style,
      type: _switchType,
      checkedIcon,
      uncheckedIcon,
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
    const isControlled = checked !== undefined
    const currentChecked = isControlled ? checked : internalChecked
    const insideLabel = currentChecked ? checkedText : uncheckedText

    const handleChange = (newChecked: boolean) => {
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      onChange?.(newChecked, {} as React.MouseEvent)
    }

    const hasInsideText = textInside && (checkedText || uncheckedText)
    const smallSwitchClass = size === 'small' ? 'h-5 [&>span]:h-4 [&>span]:w-4' : ''
    const thumbTranslateClass = hasInsideText
      ? size === 'small'
        ? '[&>span]:data-[state=checked]:!translate-x-[52px]'
        : '[&>span]:data-[state=checked]:!translate-x-[64px]'
      : size === 'small'
        ? '[&>span]:data-[state=checked]:!translate-x-5'
        : ''
    const insideSwitchClass = hasInsideText
      ? size === 'small'
        ? 'w-[72px]'
        : 'w-[88px]'
      : size === 'small'
        ? 'w-10'
        : ''

    return (
      <div className={cn('inline-flex items-center gap-2', className)} style={style}>
        <div className="relative inline-flex items-center overflow-visible">
          <ShadcnSwitch
            ref={ref}
            checked={currentChecked}
            onCheckedChange={handleChange}
            disabled={disabled || loading}
            className={cn(smallSwitchClass, thumbTranslateClass, insideSwitchClass)}
          />
          {textInside && insideLabel ? (
            <span
              className={cn(
                'pointer-events-none absolute select-none text-[10px] font-medium leading-none',
                currentChecked
                  ? 'left-1.5 text-primary-foreground'
                  : 'right-1.5 text-muted-foreground',
              )}
            >
              {insideLabel}
            </span>
          ) : null}
        </div>
        {!textInside && (checkedText || uncheckedText) ? (
          <span className="text-sm text-muted-foreground">
            {insideLabel}
          </span>
        ) : null}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
