import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  suffix?: React.ReactNode
  prefix?: React.ReactNode
}

const inputBaseStyle: React.CSSProperties = {
  display: 'flex',
  height: '32px',
  width: '100%',
  borderRadius: '4px',
  // 避免同时使用 border 简写与 borderColor（rerender 移除 borderColor 会触发 React 警告）
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--color-border-2, #e5e6eb)',
  backgroundColor: 'var(--color-bg-2, #fff)',
  padding: '4px 12px',
  fontSize: '14px',
  lineHeight: '1.5715',
  color: 'var(--color-text-1, #1d2129)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suffix, prefix, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    const mergedStyle: React.CSSProperties = {
      ...inputBaseStyle,
      borderColor: focused
        ? 'var(--color-primary, #165dff)'
        : 'var(--color-border-2, #e5e6eb)',
      boxShadow: focused
        ? '0 0 0 2px rgba(22, 93, 255, 0.1)'
        : undefined,
      ...(prefix && { paddingLeft: '32px' }),
      ...(suffix && { paddingRight: '32px' }),
      ...style,
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(e)
    }

    if (suffix || prefix) {
      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          {prefix && (
            <div style={{ position: 'absolute', left: '10px', color: 'var(--color-text-3, #86909c)' }}>
              {prefix}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            style={mergedStyle}
            className={cn(className)}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {suffix && (
            <div style={{ position: 'absolute', right: '10px', color: 'var(--color-text-3, #86909c)' }}>
              {suffix}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        style={mergedStyle}
        className={cn(className)}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
