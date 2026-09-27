import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { style?: React.CSSProperties }
>(({ className, children, style, ...props }, ref) => {
  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    height: '32px',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '4px',
    border: '1px solid var(--color-border-2, #e5e6eb)',
    backgroundColor: 'var(--color-bg-2, #fff)',
    padding: '4px 12px',
    fontSize: '14px',
    color: 'var(--color-text-1, #1d2129)',
    outline: 'none',
    cursor: 'pointer',
    ...style,
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(className)}
      style={triggerStyle}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown style={{ width: '16px', height: '16px', opacity: 0.5 }} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const scrollButtonStyle: React.CSSProperties = {
  display: 'flex',
  cursor: 'default',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 0',
}

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(className)}
    style={scrollButtonStyle}
    {...props}
  >
    <ChevronUp style={{ width: '16px', height: '16px' }} />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(className)}
    style={scrollButtonStyle}
    {...props}
  >
    <ChevronDown style={{ width: '16px', height: '16px' }} />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 50,
    maxHeight: '384px',
    minWidth: '8rem',
    overflow: 'hidden',
    borderRadius: '4px',
    border: '1px solid var(--color-border-2, #e5e6eb)',
    backgroundColor: 'var(--color-bg-2, #fff)',
    color: 'var(--color-text-1, #1d2129)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  }

  const viewportStyle: React.CSSProperties = {
    padding: '4px',
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(className)}
        style={contentStyle}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport style={viewportStyle}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(className)}
    style={{
      padding: '6px 8px 6px 28px',
      fontSize: '14px',
      fontWeight: 600,
    }}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const itemStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    width: '100%',
    cursor: 'pointer',
    userSelect: 'none',
    alignItems: 'center',
    borderRadius: '2px',
    padding: '6px 8px 6px 28px',
    fontSize: '14px',
    outline: 'none',
  }

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: '8px',
    display: 'flex',
    height: '14px',
    width: '14px',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn('select-item', className)}
      style={itemStyle}
      {...props}
    >
      <span style={indicatorStyle}>
        <SelectPrimitive.ItemIndicator>
          <Check style={{ width: '16px', height: '16px' }} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(className)}
    style={{
      margin: '4px -4px',
      height: '1px',
      backgroundColor: 'var(--color-border-2, #e5e6eb)',
    }}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
