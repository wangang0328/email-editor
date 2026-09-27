import * as React from 'react'
import { Checkbox as ShadcnCheckbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { cn } from '../../lib/utils'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  value?: string | number
  onChange?: (checked: boolean, e: React.ChangeEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      indeterminate,
      value,
      onChange,
      className,
      style,
      children,
    },
    ref
  ) => {
    const handleChange = (newChecked: boolean) => {
      onChange?.(newChecked, {} as React.ChangeEvent)
    }

    const id = React.useId()

    return (
      <div className={cn('flex items-center space-x-2', className)} style={style}>
        <ShadcnCheckbox
          ref={ref}
          id={id}
          checked={indeterminate ? 'indeterminate' : checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onCheckedChange={handleChange}
          data-value={value}
        />
        {children && (
          <Label
            htmlFor={id}
            className={cn(
              'cursor-pointer text-sm',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {children}
          </Label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export interface CheckboxOption {
  label: React.ReactNode
  value: string | number
  disabled?: boolean
}

export interface CheckboxGroupProps {
  value?: (string | number)[]
  defaultValue?: (string | number)[]
  options?: CheckboxOption[]
  disabled?: boolean
  direction?: 'vertical' | 'horizontal'
  onChange?: (value: (string | number)[], e: React.ChangeEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  defaultValue,
  options = [],
  disabled,
  direction = 'horizontal',
  onChange,
  className,
  style,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState<(string | number)[]>(
    defaultValue || []
  )
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (optionValue: string | number, checked: boolean) => {
    const newValue = checked
      ? [...currentValue, optionValue]
      : currentValue.filter((v) => v !== optionValue)

    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue, {} as React.ChangeEvent)
  }

  if (children) {
    return (
      <div
        className={cn(
          'flex gap-4',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
        style={style}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<CheckboxProps>(child)) {
            const childValue = child.props.value
            return React.cloneElement(child, {
              checked: childValue !== undefined && currentValue.includes(childValue),
              disabled: disabled || child.props.disabled,
              onChange: (checked: boolean) => {
                if (childValue !== undefined) {
                  handleChange(childValue, checked)
                }
              },
            })
          }
          return child
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-4',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
      style={style}
    >
      {options.map((option) => (
        <Checkbox
          key={String(option.value)}
          value={option.value}
          checked={currentValue.includes(option.value)}
          disabled={disabled || option.disabled}
          onChange={(checked) => handleChange(option.value, checked)}
        >
          {option.label}
        </Checkbox>
      ))}
    </div>
  )
}

CheckboxGroup.displayName = 'CheckboxGroup'

const CheckboxNamespace = Object.assign(Checkbox, {
  Group: CheckboxGroup,
})

export default CheckboxNamespace
