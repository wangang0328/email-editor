import * as React from 'react'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'

export interface AutoCompleteOption {
  value: string
  name?: string
  extra?: Record<string, unknown>
}

export interface AutoCompleteProps {
  value?: string
  defaultValue?: string
  data?: (string | AutoCompleteOption)[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  allowClear?: boolean
  error?: boolean
  status?: 'error' | 'warning'
  size?: 'mini' | 'small' | 'default' | 'large'
  strict?: boolean
  triggerElement?: React.ReactElement
  virtualListProps?: { height?: number }
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  getPopupContainer?: () => HTMLElement
  dropdownMenuStyle?: React.CSSProperties
  dropdownMenuClassName?: string
  onChange?: (value: string, option?: AutoCompleteOption) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onSearch?: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const sizeClasses = {
  mini: 'h-6 text-xs',
  small: 'h-8 text-sm',
  default: 'h-10 text-sm',
  large: 'h-12 text-base',
}

export const AutoComplete = React.forwardRef<HTMLInputElement, AutoCompleteProps>(
  (
    {
      value,
      defaultValue,
      data = [],
      placeholder,
      disabled,
      loading,
      allowClear,
      error,
      status,
      size = 'default',
      strict = true,
      filterOption = true,
      onChange,
      onSelect,
      onSearch,
      onFocus,
      onBlur,
      onPressEnter,
      className,
      style,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? '')
    const [isOpen, setIsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const normalizedOptions: AutoCompleteOption[] = data.map((item) =>
      typeof item === 'string' ? { value: item } : item
    )

    const filteredOptions = React.useMemo(() => {
      if (!filterOption || !currentValue) return normalizedOptions

      return normalizedOptions.filter((option) => {
        if (typeof filterOption === 'function') {
          return filterOption(currentValue, option)
        }
        return option.value.toLowerCase().includes(currentValue.toLowerCase())
      })
    }, [normalizedOptions, currentValue, filterOption])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
      onSearch?.(newValue)
      setIsOpen(true)
      setHighlightedIndex(-1)
    }

    const handleSelect = (option: AutoCompleteOption) => {
      if (!isControlled) {
        setInternalValue(option.value)
      }
      onChange?.(option.value, option)
      onSelect?.(option.value, option)
      setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        onPressEnter?.(e)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsOpen(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        setIsOpen(false)
      }, 200)
      onBlur?.(e)
    }

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('')
      }
      onChange?.('')
    }

    return (
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        <div className="relative">
          <Input
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              sizeClasses[size],
              (error || status === 'error') && 'border-red-500 focus-visible:ring-red-500',
              status === 'warning' && 'border-yellow-500 focus-visible:ring-yellow-500',
              allowClear && currentValue && 'pr-8'
            )}
          />
          {allowClear && currentValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer',
                    index === highlightedIndex && 'bg-accent',
                    'hover:bg-accent'
                  )}
                >
                  {option.name || option.value}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }
)

AutoComplete.displayName = 'AutoComplete'

export default AutoComplete
