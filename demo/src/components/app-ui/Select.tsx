import * as React from 'react'
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '../ui/select'
import { cn } from '../../lib/utils'

/** Radix Select.Item 不允许 value=""，用占位符表示 Arco 里的「空值」选项 */
const RADIX_EMPTY_OPTION_VALUE = '__email_editor_select_empty__'

function toRadixItemValue(v: string | number): string {
  const s = String(v)
  return s === '' ? RADIX_EMPTY_OPTION_VALUE : s
}

function fromRadixItemValue(s: string): string {
  return s === RADIX_EMPTY_OPTION_VALUE ? '' : s
}

type SelectSize = 'mini' | 'small' | 'default' | 'large'

export interface SelectOption {
  label: React.ReactNode
  value: string | number
  disabled?: boolean
  extra?: Record<string, unknown>
}

export interface SelectProps {
  value?: string | number | string[] | number[]
  defaultValue?: string | number | string[] | number[]
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  allowClear?: boolean
  allowCreate?: boolean
  showSearch?: boolean
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean)
  size?: SelectSize
  mode?: 'multiple' | undefined
  maxTagCount?: number
  bordered?: boolean
  error?: boolean
  status?: 'error' | 'warning'
  triggerProps?: Record<string, unknown>
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuClassName?: string
  getPopupContainer?: () => HTMLElement
  onChange?: (value: string | number | string[] | number[], option?: SelectOption | SelectOption[]) => void
  onSearch?: (inputValue: string) => void
  onClear?: () => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const sizeClasses: Record<SelectSize, string> = {
  mini: 'h-6',
  small: 'h-8',
  default: 'h-10',
  large: 'h-12',
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      options = [],
      placeholder = 'Select...',
      disabled,
      loading,
      size = 'default',
      error,
      status,
      onChange,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const handleChange = (newValue: string) => {
      const normalized = fromRadixItemValue(newValue)
      const option = options.find((opt) =>
        String(opt.value) === '' ? newValue === RADIX_EMPTY_OPTION_VALUE : String(opt.value) === newValue
      )
      const out =
        option && typeof option.value === 'number' && normalized !== ''
          ? Number(newValue)
          : normalized === ''
            ? option?.value ?? ''
            : normalized
      onChange?.(out as string | number, option)
    }

    const renderOptions = () => {
      if (children) {
        return children
      }
      return options.map((option, index) => (
        <SelectItem
          key={String(option.value) === '' ? `empty-${index}` : String(option.value)}
          value={toRadixItemValue(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </SelectItem>
      ))
    }

    const radixValue =
      value !== undefined && value !== null
        ? String(value) === ''
          ? RADIX_EMPTY_OPTION_VALUE
          : String(value)
        : undefined

    const radixDefault =
      defaultValue !== undefined && defaultValue !== null
        ? String(defaultValue) === ''
          ? RADIX_EMPTY_OPTION_VALUE
          : String(defaultValue)
        : undefined

    return (
      <ShadcnSelect
        value={radixValue}
        defaultValue={radixDefault}
        onValueChange={handleChange}
        disabled={disabled || loading}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            sizeClasses[size],
            (error || status === 'error') && 'border-red-500 focus:ring-red-500',
            status === 'warning' && 'border-yellow-500 focus:ring-yellow-500',
            className
          )}
          style={style}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {renderOptions()}
        </SelectContent>
      </ShadcnSelect>
    )
  }
)

Select.displayName = 'Select'

export interface OptionProps {
  value: string | number
  disabled?: boolean
  extra?: Record<string, unknown>
  children?: React.ReactNode
  className?: string
}

export const Option: React.FC<OptionProps> = ({
  value,
  disabled,
  children,
  className,
}) => {
  return (
    <SelectItem
      value={toRadixItemValue(value)}
      disabled={disabled}
      className={className}
    >
      {children}
    </SelectItem>
  )
}

Option.displayName = 'Option'

export interface OptGroupProps {
  label?: React.ReactNode
  children?: React.ReactNode
}

export const OptGroup: React.FC<OptGroupProps> = ({ label, children }) => {
  return (
    <SelectGroup>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </SelectGroup>
  )
}

OptGroup.displayName = 'OptGroup'

const SelectNamespace = Object.assign(Select, {
  Option,
  OptGroup,
})

export default SelectNamespace
