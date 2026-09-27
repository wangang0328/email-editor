import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    style?: React.CSSProperties
  }
>(({ className, style, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('ee-accordion-item border-b border-border/70 last:border-b-0', className)}
    style={{
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      ...style,
    }}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    style?: React.CSSProperties
  }
>(({ className, children, style, ...props }, ref) => (
  <AccordionPrimitive.Header
    className="ee-accordion-header"
    style={{ display: 'flex', width: '100%' }}
  >
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn('accordion-trigger group', className)}
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '11px 4px',
        fontWeight: 500,
        fontSize: '13px',
        color: 'var(--color-text-2, #4e5969)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.15s ease',
        width: '100%',
        textAlign: 'left',
        ...style,
      }}
      {...props}
    >
      {children}
      <ChevronDown
        className="accordion-chevron h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    style?: React.CSSProperties
  }
>(({ className, children, style, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn('ee-accordion-content', className)}
    style={style}
    {...props}
  >
    <div className="ee-accordion-content-inner">
      <div className="ee-accordion-content-body">{children}</div>
    </div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
