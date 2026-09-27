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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Checkbox } from '../ui/checkbox'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'
import { ChevronDown, X } from 'lucide-react'

/** Radix Select.Item 不允许 value=""，用占位符表示「空值」选项 */
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
  /** 为空时不展示提示；仅显式传入时才显示 */
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  /** 有值时 hover 显示清空图标；默认 true */
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
  onChange?: (
    value: string | number | string[] | number[],
    option?: SelectOption | SelectOption[],
  ) => void
  onSearch?: (inputValue: string) => void
  onClear?: () => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const sizeClasses: Record<SelectSize, string> = {
  mini: 'h-6 text-xs',
  small: 'h-7 text-xs',
  default: 'h-9 text-sm',
  large: 'h-10 text-sm',
}

function hasMeaningfulValue(value: SelectProps['value']): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  return String(value) !== ''
}

function optionLabel(
  options: SelectOption[],
  optionValue: string | number,
): React.ReactNode {
  const found = options.find(opt => String(opt.value) === String(optionValue))
  return found?.label ?? String(optionValue)
}

function filterVisibleOptions(options: SelectOption[]): SelectOption[] {
  return options.filter(option => {
    if (String(option.value) === '') return false
    const label = option.label
    if (
      typeof label === 'string' &&
      (label === '–' || label === '-' || label.trim() === '')
    ) {
      return false
    }
    return true
  })
}

const MultiSelectControl = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      options = [],
      placeholder,
      disabled,
      loading,
      allowClear = true,
      size = 'default',
      maxTagCount = 2,
      error,
      status,
      onChange,
      onClear,
      className,
      style,
      getPopupContainer,
      dropdownMenuClassName,
      dropdownMenuStyle,
      onOpenChange,
      open: openProp,
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const [hovered, setHovered] = React.useState(false)
    const open = openProp ?? uncontrolledOpen
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    }

    const selected = React.useMemo(() => {
      if (!Array.isArray(value)) return [] as Array<string | number>
      return value
    }, [value])

    const visibleOptions = React.useMemo(
      () => filterVisibleOptions(options),
      [options],
    )

    const displayCount = Math.max(0, maxTagCount)
    const visibleTags = selected.slice(0, displayCount)
    const overflowCount = Math.max(0, selected.length - visibleTags.length)

    const emitChange = (next: Array<string | number>) => {
      const selectedOptions = next
        .map(v => options.find(opt => String(opt.value) === String(v)))
        .filter(Boolean) as SelectOption[]
      onChange?.(next as string[] | number[], selectedOptions)
    }

    const toggle = (optionValue: string | number, checked: boolean) => {
      const next = checked
        ? [...selected, optionValue]
        : selected.filter(item => String(item) !== String(optionValue))
      emitChange(next)
    }

    const remove = (
      optionValue: string | number,
      event: React.MouseEvent | React.PointerEvent,
    ) => {
      event.preventDefault()
      event.stopPropagation()
      emitChange(selected.filter(item => String(item) !== String(optionValue)))
    }

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClear?.()
      emitChange([])
    }

    const showClear =
      allowClear && !disabled && !loading && selected.length > 0 && hovered

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled || loading}>
          <button
            ref={ref}
            type="button"
            className={cn(
              EDITOR_CLASS.selectTrigger,
              'ee-multi-select group flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-background px-3 text-left text-foreground outline-none transition-colors',
              'hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              sizeClasses[size],
              (error || status === 'error') && 'border-destructive',
              status === 'warning' && 'border-yellow-500',
              (disabled || loading) && 'cursor-not-allowed opacity-50',
              className,
            )}
            style={{ ...style, height: 'auto', minHeight: size === 'mini' ? 24 : size === 'small' ? 28 : size === 'large' ? 40 : 36 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-0.5">
              {selected.length === 0 ? (
                placeholder ? (
                  <span className="truncate text-muted-foreground">
                    {placeholder}
                  </span>
                ) : null
              ) : (
                <>
                  {visibleTags.map(item => (
                    <span
                      key={String(item)}
                      className="inline-flex max-w-[140px] items-center gap-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-xs leading-5 text-secondary-foreground"
                    >
                      <span className="min-w-0 truncate">
                        {optionLabel(options, item)}
                      </span>
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label={`remove ${String(item)}`}
                        className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
                        onPointerDown={event => remove(item, event)}
                        onClick={event => remove(item, event)}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </span>
                  ))}
                  {overflowCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center rounded-md bg-muted px-1.5 py-0.5 text-xs leading-5 text-muted-foreground">
                      +{overflowCount}
                    </span>
                  ) : null}
                </>
              )}
            </span>
            {showClear ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="清空"
                className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onPointerDown={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={handleClear}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          container={getPopupContainer?.()}
          className={cn(
            EDITOR_CLASS.popoverContent,
            'ee-multi-select-content w-[var(--radix-popover-trigger-width)] p-0',
            dropdownMenuClassName,
          )}
          style={dropdownMenuStyle}
        >
          <ScrollArea className="h-[240px]">
            <div className="p-1">
              {visibleOptions.map(option => {
                const checked = selected.some(
                  item => String(item) === String(option.value),
                )
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={option.disabled}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'disabled:pointer-events-none disabled:opacity-50',
                    )}
                    onClick={() => toggle(option.value, !checked)}
                  >
                    <Checkbox
                      checked={checked}
                      className="pointer-events-none"
                      tabIndex={-1}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    )
  },
)

MultiSelectControl.displayName = 'MultiSelectControl'

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (props, ref) => {
    if (props.mode === 'multiple' || Array.isArray(props.value)) {
      return <MultiSelectControl ref={ref} {...props} />
    }

    const {
      value,
      defaultValue,
      options = [],
      placeholder,
      disabled,
      loading,
      allowClear = true,
      size = 'default',
      error,
      status,
      onChange,
      onClear,
      className,
      style,
      children,
      getPopupContainer,
      dropdownMenuClassName,
      dropdownMenuStyle,
      onOpenChange,
      open,
    } = props

    const triggerRef = React.useRef<HTMLButtonElement | null>(null)
    const [hovered, setHovered] = React.useState(false)
    /** Radix 清空后需 remount，否则会残留上一次展示文案 */
    const [resetKey, setResetKey] = React.useState(0)

    const setTriggerRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref && 'current' in ref) {
          Object.assign(ref, { current: node })
        }
      },
      [ref],
    )

    const handleChange = (newValue: string) => {
      const normalized = fromRadixItemValue(newValue)
      const option = options.find(opt =>
        String(opt.value) === ''
          ? newValue === RADIX_EMPTY_OPTION_VALUE
          : String(opt.value) === newValue,
      )
      const out =
        option && typeof option.value === 'number' && normalized !== ''
          ? Number(newValue)
          : normalized === ''
            ? (option?.value ?? '')
            : normalized
      onChange?.(out as string | number, option)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClear?.()
      onChange?.('', undefined)
      setResetKey(k => k + 1)
    }

    const renderOptions = () => {
      if (children) {
        return children
      }
      return filterVisibleOptions(options).map((option, index) => (
        <SelectItem
          key={
            String(option.value) === ''
              ? `empty-${index}`
              : String(option.value)
          }
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
          ? undefined
          : String(value)
        : undefined

    const radixDefault =
      defaultValue !== undefined && defaultValue !== null
        ? String(defaultValue) === ''
          ? undefined
          : String(defaultValue)
        : undefined

    const showClear =
      allowClear && !disabled && !loading && hasMeaningfulValue(value) && hovered

    return (
      <ShadcnSelect
        key={resetKey}
        value={radixValue}
        defaultValue={radixDefault}
        open={open}
        onOpenChange={onOpenChange}
        onValueChange={handleChange}
        disabled={disabled || loading}
      >
        <SelectTrigger
          ref={setTriggerRef}
          hideIcon
          className={cn(
            EDITOR_CLASS.selectTrigger,
            'group',
            sizeClasses[size],
            (error || status === 'error') &&
              'border-destructive focus:ring-destructive',
            status === 'warning' && 'border-yellow-500 focus:ring-yellow-500',
            className,
          )}
          style={style}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <SelectValue
            className={cn(EDITOR_CLASS.selectValue, 'ee-select-value')}
            placeholder={placeholder}
          />
          {/* 固定宽槽位：清空 / 下拉图标占同一位置，避免 hover 跳动 */}
          <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
            {showClear ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="清空"
                className="absolute inset-0 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onPointerDown={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={handleClear}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        </SelectTrigger>
        <SelectContent
          className={dropdownMenuClassName}
          style={dropdownMenuStyle}
          container={getPopupContainer?.()}
          onCloseAutoFocus={event => {
            event.preventDefault()
          }}
          onPointerDownOutside={event => {
            const target = event.target as Node | null
            if (target && triggerRef.current?.contains(target)) {
              event.preventDefault()
            }
          }}
        >
          {renderOptions()}
        </SelectContent>
      </ShadcnSelect>
    )
  },
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
  if (String(value) === '') return null
  if (typeof children === 'string' && (children === '–' || children === '-'))
    return null

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
