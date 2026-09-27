import * as React from 'react'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

type InputNumberSize = 'mini' | 'small' | 'default' | 'large'
type InputNumberMode = 'embed' | 'button'

export interface InputNumberProps {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  readOnly?: boolean
  error?: boolean
  size?: InputNumberSize
  mode?: InputNumberMode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  formatter?: (value: number | string) => string
  parser?: (value: string) => number
  placeholder?: string
  hideControl?: boolean
  strictMode?: boolean
  onChange?: (value: number | undefined) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
  style?: React.CSSProperties
}

const sizeStyles: Record<InputNumberSize, React.CSSProperties> = {
  mini: { height: '24px', fontSize: '12px' },
  small: { height: '28px', fontSize: '13px' },
  default: { height: '32px', fontSize: '14px' },
  large: { height: '36px', fontSize: '14px' },
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      step = 1,
      precision,
      disabled,
      readOnly,
      error,
      size = 'default',
      mode = 'embed',
      prefix,
      suffix,
      formatter,
      parser,
      placeholder,
      hideControl,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      className,
      style,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | undefined>(
      value ?? defaultValue
    )
    const [inputValue, setInputValue] = React.useState<string>(
      formatValue(value ?? defaultValue)
    )

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    function formatValue(val: number | undefined): string {
      if (val === undefined) return ''
      if (formatter) return formatter(val)
      if (precision !== undefined) return val.toFixed(precision)
      return String(val)
    }

    function parseValue(val: string): number | undefined {
      if (val === '' || val === '-') return undefined
      const parsed = parser ? parser(val) : parseFloat(val)
      if (isNaN(parsed)) return undefined
      return Math.min(max, Math.max(min, parsed))
    }

    React.useEffect(() => {
      if (isControlled) {
        setInputValue(formatValue(value))
      }
    }, [value, isControlled])

    const updateValue = (newValue: number | undefined) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      setInputValue(formatValue(newValue))
      onChange?.(newValue)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue(val)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseValue(inputValue)
      updateValue(parsed)
      onBlur?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        increment()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        decrement()
      } else if (e.key === 'Enter') {
        const parsed = parseValue(inputValue)
        updateValue(parsed)
      }
      onKeyDown?.(e)
    }

    const increment = () => {
      const current = currentValue ?? 0
      const newValue = Math.min(max, current + step)
      updateValue(precision !== undefined ? parseFloat(newValue.toFixed(precision)) : newValue)
    }

    const decrement = () => {
      const current = currentValue ?? 0
      const newValue = Math.max(min, current - step)
      updateValue(precision !== undefined ? parseFloat(newValue.toFixed(precision)) : newValue)
    }

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      width: '100%',
      ...style,
    }

    const inputStyle: React.CSSProperties = {
      ...sizeStyles[size],
      ...(prefix && { paddingLeft: '32px' }),
      ...((suffix || !hideControl) && { paddingRight: '32px' }),
      ...(error && { borderColor: '#f53f3f' }),
    }

    const prefixStyle: React.CSSProperties = {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--color-text-3, #86909c)',
    }

    const suffixStyle: React.CSSProperties = {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--color-text-3, #86909c)',
    }

    const controlStyle: React.CSSProperties = {
      position: 'absolute',
      right: '4px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
    }

    const buttonStyle: React.CSSProperties = {
      padding: '2px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    return (
      <div className={cn(className)} style={wrapperStyle}>
        {prefix && (
          <span style={prefixStyle}>
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          style={inputStyle}
        />
        {!hideControl && mode === 'embed' && (
          <div style={controlStyle}>
            <button
              type="button"
              onClick={increment}
              disabled={disabled || readOnly || (currentValue !== undefined && currentValue >= max)}
              style={{
                ...buttonStyle,
                opacity: disabled || readOnly || (currentValue !== undefined && currentValue >= max) ? 0.5 : 1,
              }}
            >
              <ChevronUp style={{ width: '12px', height: '12px' }} />
            </button>
            <button
              type="button"
              onClick={decrement}
              disabled={disabled || readOnly || (currentValue !== undefined && currentValue <= min)}
              style={{
                ...buttonStyle,
                opacity: disabled || readOnly || (currentValue !== undefined && currentValue <= min) ? 0.5 : 1,
              }}
            >
              <ChevronDown style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        )}
        {suffix && (
          <span style={suffixStyle}>
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

InputNumber.displayName = 'InputNumber'

export default InputNumber
