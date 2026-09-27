import * as React from 'react'
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { cn } from '../../lib/utils'

type RadioSize = 'small' | 'default' | 'large' | 'mini'
type RadioType = 'radio' | 'button'
type RadioDirection = 'vertical' | 'horizontal'

export interface RadioOption {
  label: React.ReactNode
  value: string | number
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string | number
  defaultValue?: string | number
  options?: RadioOption[]
  disabled?: boolean
  size?: RadioSize
  type?: RadioType
  direction?: RadioDirection
  name?: string
  onChange?: (value: string | number, e: React.ChangeEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  options = [],
  disabled,
  size = 'default',
  type = 'radio',
  direction = 'horizontal',
  name,
  onChange,
  className,
  style,
  children,
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue, {} as React.ChangeEvent)
  }

  const renderOptions = () => {
    if (children) {
      return children
    }

    return options.map((option) => (
      <div key={String(option.value)} className="flex items-center space-x-2">
        <RadioGroupItem
          value={String(option.value)}
          id={`${name || 'radio'}-${option.value}`}
          disabled={option.disabled || disabled}
        />
        <Label
          htmlFor={`${name || 'radio'}-${option.value}`}
          className={cn(
            'cursor-pointer',
            (option.disabled || disabled) && 'cursor-not-allowed opacity-50'
          )}
        >
          {option.label}
        </Label>
      </div>
    ))
  }

  const sizeClasses: Record<RadioSize, string> = {
    mini: 'gap-2 text-xs',
    small: 'gap-3 text-sm',
    default: 'gap-4 text-sm',
    large: 'gap-5 text-base',
  }

  if (type === 'button') {
    const optionId = (val: string | number) => `${name || 'radio'}-${val}`

    return (
      <ShadcnRadioGroup
        value={value !== undefined ? String(value) : undefined}
        defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
        onValueChange={handleChange}
        disabled={disabled}
        className={cn(
          'ee-radio-button-group',
          direction === 'vertical' && 'ee-radio-button-group--vertical',
          sizeClasses[size],
          className,
        )}
        style={style}
      >
        {options.map((option) => (
          <div key={String(option.value)} className="ee-radio-button-wrap">
            <RadioGroupItem
              value={String(option.value)}
              id={optionId(option.value)}
              disabled={option.disabled || disabled}
              className="ee-radio-button-input"
            />
            <Label
              htmlFor={optionId(option.value)}
              className={cn(
                'ee-radio-button-label',
                (option.disabled || disabled) && 'cursor-not-allowed opacity-50',
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </ShadcnRadioGroup>
    )
  }

  return (
    <ShadcnRadioGroup
      value={value !== undefined ? String(value) : undefined}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
      onValueChange={handleChange}
      disabled={disabled}
      className={cn(
        direction === 'vertical' ? 'flex flex-col' : 'flex flex-row',
        sizeClasses[size],
        className
      )}
      style={style}
    >
      {renderOptions()}
    </ShadcnRadioGroup>
  )
}

RadioGroup.displayName = 'RadioGroup'

export interface RadioProps {
  value?: string | number
  disabled?: boolean
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean, e: React.ChangeEvent) => void
  className?: string
  children?: React.ReactNode
  id?: string
}

export const Radio: React.FC<RadioProps> = ({
  value,
  disabled,
  children,
  className,
  id,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <RadioGroupItem id={id || String(value)} value={String(value)} disabled={disabled} />
      {children && <Label htmlFor={String(value)}>{children}</Label>}
    </div>
  )
}

Radio.displayName = 'Radio'

const RadioNamespace = Object.assign(Radio, {
  Group: RadioGroup,
})

export default RadioNamespace
