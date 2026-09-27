import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'

export interface CollapseProps {
  activeKey?: string | string[]
  defaultActiveKey?: string | string[]
  accordion?: boolean
  bordered?: boolean
  expandIcon?: React.ReactNode
  expandIconPosition?: 'left' | 'right'
  destroyOnHide?: boolean
  lazyload?: boolean
  onChange?: (key: string | string[], e?: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Collapse: React.FC<CollapseProps> = ({
  activeKey,
  defaultActiveKey,
  accordion = false,
  bordered = true,
  onChange,
  className,
  style,
  children,
}) => {
  const handleValueChange = (value: string | string[]) => {
    onChange?.(value)
  }

  const isMultipleControlled = !accordion && activeKey !== undefined && activeKey !== null
  const isSingleControlled =
    accordion && activeKey !== undefined && activeKey !== null && activeKey !== ''

  const accordionProps = accordion
    ? {
        type: 'single' as const,
        collapsible: true,
        ...(isSingleControlled
          ? {
              value: Array.isArray(activeKey) ? activeKey[0] : activeKey,
              onValueChange: (value: string) => handleValueChange(value),
            }
          : {
              defaultValue: Array.isArray(defaultActiveKey) ? defaultActiveKey[0] : defaultActiveKey,
              onValueChange: (value: string) => handleValueChange(value),
            }),
      }
    : {
        type: 'multiple' as const,
        ...(isMultipleControlled
          ? {
              value: Array.isArray(activeKey) ? activeKey : [],
              onValueChange: (value: string[]) => handleValueChange(value),
            }
          : {
              /* Radix multiple 未传时给 []，避免 defaultValue=undefined 边界行为 */
              defaultValue:
                defaultActiveKey === undefined || defaultActiveKey === null
                  ? []
                  : Array.isArray(defaultActiveKey)
                    ? defaultActiveKey
                    : [defaultActiveKey],
              onValueChange: (value: string[]) => handleValueChange(value),
            }),
      }

  const collapseStyle: React.CSSProperties = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    ...(bordered
      ? {
          border: 'none',
          borderRadius: 0,
        }
      : {}),
    ...style,
  }

  return (
    <Accordion
      {...accordionProps}
      className={cn(className)}
      style={collapseStyle}
    >
      {children}
    </Accordion>
  )
}

Collapse.displayName = 'Collapse'

export interface CollapseItemProps {
  name: string
  header?: React.ReactNode
  disabled?: boolean
  showExpandIcon?: boolean
  destroyOnHide?: boolean
  extra?: React.ReactNode
  contentStyle?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

export const CollapseItem: React.FC<CollapseItemProps> = ({
  name,
  header,
  disabled,
  destroyOnHide = false,
  extra,
  contentStyle,
  className,
  children,
}) => {
  return (
    <AccordionItem
      value={name}
      disabled={disabled}
      className={cn(EDITOR_CLASS.collapseItem, className)}
    >
      <AccordionTrigger className={EDITOR_CLASS.collapseItemHeader}>
        <span className="ee-accordion-title min-w-0 flex-1 truncate text-left">
          {header ?? name}
        </span>
        {!!extra && <span className="ee-accordion-extra shrink-0">{extra}</span>}
      </AccordionTrigger>
      <AccordionContent
        style={contentStyle}
        {...(!destroyOnHide ? { forceMount: true as const } : {})}
      >
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

CollapseItem.displayName = 'CollapseItem'

const CollapseNamespace = Object.assign(Collapse, {
  Item: CollapseItem,
})

export default CollapseNamespace
