import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input as ShadcnInput } from '../ui/input'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'
import '../../styles/input-number.css'

type InputSize = 'mini' | 'small' | 'default' | 'large'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'onChange'> {
  size?: InputSize
  allowClear?: boolean
  error?: boolean
  status?: 'error' | 'warning'
  addBefore?: React.ReactNode
  addAfter?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  beforeStyle?: React.CSSProperties
  afterStyle?: React.CSSProperties
  height?: number | string
  onClear?: () => void
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  searchButton?: React.ReactNode
  onSearch?: (value: string) => void
  /** Arco 约定：首参为输入字符串，次参为原生 change 事件 */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
}

/** 与 Arco Input.Search 兼容，适配层中 Search 即 Input */
export type InputSearchProps = InputProps

const sizeStyles: Record<InputSize, React.CSSProperties> = {
  mini: { height: '24px', fontSize: '12px', padding: '0 8px' },
  small: { height: '28px', fontSize: '13px', padding: '0 8px' },
  default: { height: '32px', fontSize: '14px', padding: '0 12px' },
  large: { height: '36px', fontSize: '14px', padding: '0 16px' },
}

const numberAddonSize: Record<InputSize, number> = {
  mini: 20,
  small: 22,
  default: 24,
  large: 26,
}

type NumberSuffixAddonProps = {
  suffix: React.ReactNode
  size: InputSize
  value?: string | number | readonly string[]
  min?: string | number
  max?: string | number
  step?: string | number
  disabled?: boolean
  readOnly?: boolean
  showStepper: boolean
  onAdjust: (next: string) => void
}

function NumberSuffixAddon({
  suffix,
  size,
  value,
  min,
  max,
  step: stepProp,
  disabled,
  readOnly,
  showStepper,
  onAdjust,
}: NumberSuffixAddonProps) {
  const getStep = () => {
    const s = stepProp !== undefined ? Number(stepProp) : 1
    return Number.isFinite(s) && s > 0 ? s : 1
  }

  const clamp = (n: number) => {
    let v = n
    if (min !== undefined && min !== '') {
      const mn = Number(min)
      if (Number.isFinite(mn)) v = Math.max(mn, v)
    }
    if (max !== undefined && max !== '') {
      const mx = Number(max)
      if (Number.isFinite(mx)) v = Math.min(mx, v)
    }
    return v
  }

  const adjust = (dir: 1 | -1) => {
    const current = parseFloat(String(value ?? ''))
    const base = Number.isFinite(current) ? current : 0
    onAdjust(String(clamp(base + dir * getStep())))
  }

  const currentNum = parseFloat(String(value ?? ''))
  const atMax =
    max !== undefined &&
    Number.isFinite(Number(max)) &&
    Number.isFinite(currentNum) &&
    currentNum >= Number(max)
  const atMin =
    min !== undefined &&
    Number.isFinite(Number(min)) &&
    Number.isFinite(currentNum) &&
    currentNum <= Number(min)

  const sizeClass = EDITOR_CLASS.inputNumberAddonSize[size]

  return (
    <span className={cn(EDITOR_CLASS.inputNumberAddon, sizeClass)}>
      <span
        className={cn(
          EDITOR_CLASS.inputNumberSuffix,
          showStepper && EDITOR_CLASS.inputNumberSuffixHidden,
        )}
      >
        {suffix}
      </span>
      <div
        className={cn(
          EDITOR_CLASS.inputNumberStepper,
          showStepper && EDITOR_CLASS.inputNumberStepperVisible,
        )}
      >
        <button
          type="button"
          className={EDITOR_CLASS.inputNumberStepBtn}
          aria-label="increment"
          disabled={disabled || readOnly || atMax}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => adjust(1)}
        >
          <ChevronUp strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className={EDITOR_CLASS.inputNumberStepBtn}
          aria-label="decrement"
          disabled={disabled || readOnly || atMin}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => adjust(-1)}
        >
          <ChevronDown strokeWidth={2.5} />
        </button>
      </div>
    </span>
  )
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'default',
      allowClear,
      error,
      status,
      addBefore,
      addAfter: addAfterProp,
      searchButton,
      onSearch,
      prefix,
      suffix,
      beforeStyle,
      afterStyle,
      height,
      className,
      style,
      value,
      onChange,
      onClear,
      onPressEnter,
      onKeyDown,
      onFocus,
      onBlur,
      type,
      min,
      max,
      step,
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const [addonHovered, setAddonHovered] = React.useState(false)
    const [addonFocused, setAddonFocused] = React.useState(false)
    const isNumberWithSuffix = type === 'number' && Boolean(suffix)
    const showNumberStepper =
      isNumberWithSuffix && (addonHovered || addonFocused) && !disabled && !readOnly

    const addAfter =
      addAfterProp ??
      (searchButton ? (
        <button
          type="button"
          className={EDITOR_CLASS.btnDefault}
          onClick={() => onSearch?.(String(value ?? ''))}
        >
          {searchButton}
        </button>
      ) : undefined)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onPressEnter) {
        onPressEnter(e)
      }
      onKeyDown?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return
      onChange(e.target.value, e)
    }

    const handleClear = () => {
      onClear?.()
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        handleChange(event)
      }
    }

    const emitValue = (next: string) => {
      if (!onChange) return
      const event = { target: { value: next } } as React.ChangeEvent<HTMLInputElement>
      onChange(next, event)
    }

    const suffixPaddingRight = isNumberWithSuffix
      ? `${numberAddonSize[size] + 10}px`
      : suffix || allowClear
        ? '32px'
        : undefined

    const inputStyle: React.CSSProperties = {
      ...sizeStyles[size],
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
      ...(prefix && { paddingLeft: '32px' }),
      ...(suffixPaddingRight && { paddingRight: suffixPaddingRight }),
      ...((error || status === 'error') && { borderColor: '#f53f3f' }),
      ...(status === 'warning' && { borderColor: '#ff7d00' }),
      ...style,
    }

    const inputElement = (
      <div
        className={EDITOR_CLASS.inputWithAddon}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}
        onMouseEnter={() => setAddonHovered(true)}
        onMouseLeave={() => setAddonHovered(false)}
      >
        {prefix && (
          <span style={{ 
            position: 'absolute', 
            left: '10px', 
            color: 'var(--color-text-3, #86909c)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            {prefix}
          </span>
        )}
        <ShadcnInput
          ref={ref}
          type={type}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setAddonFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setAddonFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            className,
            type === 'number' && EDITOR_CLASS.inputNumberNative,
          )}
          style={inputStyle}
          {...props}
          {...(value !== undefined && value !== null ? { value: value as string } : {})}
        />
        {isNumberWithSuffix ? (
          <NumberSuffixAddon
            suffix={suffix}
            size={size}
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            showStepper={showNumberStepper}
            onAdjust={emitValue}
          />
        ) : (
          (suffix || (allowClear && value)) && (
            <span style={{ 
              position: 'absolute', 
              right: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              {allowClear && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    color: 'var(--color-text-3, #86909c)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6M9 9l6 6" />
                  </svg>
                </button>
              )}
              {suffix}
            </span>
          )
        )}
      </div>
    )

    if (addBefore || addAfter) {
      return (
        <div className={EDITOR_CLASS.inputGroup} style={{ display: 'flex', alignItems: 'center' }}>
          {addBefore && (
            <span
              style={{
                padding: '0 12px',
                border: '1px solid var(--color-border-2, #e5e6eb)',
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
                backgroundColor: 'var(--color-fill-2, #f2f3f5)',
                color: 'var(--color-text-2, #4e5969)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                height: sizeStyles[size].height,
                ...beforeStyle,
              }}
            >
              {addBefore}
            </span>
          )}
          <div style={{ 
            flex: 1,
            ...(addBefore && { 
              borderTopLeftRadius: 0, 
              borderBottomLeftRadius: 0,
            }),
            ...(addAfter && { 
              borderTopRightRadius: 0, 
              borderBottomRightRadius: 0,
            }),
          }}>
            {inputElement}
          </div>
          {addAfter && (
            <span
              className={EDITOR_CLASS.inputGroupAddon}
              style={{
                padding: '0 12px',
                border: '1px solid var(--color-border-2, #e5e6eb)',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                backgroundColor: 'var(--color-fill-2, #f2f3f5)',
                color: 'var(--color-text-2, #4e5969)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                height: sizeStyles[size].height,
                ...afterStyle,
              }}
            >
              {addAfter}
            </span>
          )}
        </div>
      )
    }

    return inputElement
  }
)

Input.displayName = 'Input'

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  allowClear?: boolean
  error?: boolean
  status?: 'error' | 'warning'
  onClear?: () => void
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      autoSize,
      allowClear,
      error,
      status,
      className,
      style,
      value,
      onChange,
      onClear,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false)
    const isControlled = value !== undefined && value !== null
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!onChange) return
      onChange(e.target.value, e)
    }

    const handleClear = () => {
      onClear?.()
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLTextAreaElement>
        onChange('', event)
      }
    }

    const minRows = typeof autoSize === 'object' ? autoSize.minRows : undefined
    const maxRows = typeof autoSize === 'object' ? autoSize.maxRows : undefined

    const textareaStyle: React.CSSProperties = {
      display: 'flex',
      minHeight: '80px',
      width: '100%',
      borderRadius: '4px',
      border: '1px solid var(--color-border-2, #e5e6eb)',
      backgroundColor: 'var(--color-bg-2, #fff)',
      padding: '8px 12px',
      fontSize: '14px',
      lineHeight: '1.5715',
      color: 'var(--color-text-1, #1d2129)',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      resize: autoSize ? 'none' : 'vertical',
      ...(focused && {
        borderColor: 'var(--color-primary, #165dff)',
        boxShadow: '0 0 0 2px rgba(22, 93, 255, 0.1)',
      }),
      ...((error || status === 'error') && {
        borderColor: '#f53f3f',
      }),
      ...(status === 'warning' && {
        borderColor: '#ff7d00',
      }),
      ...(maxRows && { maxHeight: `${maxRows * 1.5}em` }),
      ...style,
    }

    return (
      <div style={{ position: 'relative' }}>
        <textarea
          ref={ref}
          {...props}
          {...(isControlled ? { value: value as string } : {})}
          onChange={handleChange}
          rows={minRows || 3}
          className={cn(className)}
          style={textareaStyle}
          onFocus={e => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setFocused(false)
            onBlur?.(e)
          }}
        />
        {allowClear && value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              color: 'var(--color-text-3, #86909c)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

const InputNamespace = Object.assign(Input, {
  TextArea,
  Search: Input,
  Password: Input,
  Group: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }): React.ReactElement => (
    <div className={cn('flex items-center gap-2', className)}>{children}</div>
  ),
})

export default InputNamespace
