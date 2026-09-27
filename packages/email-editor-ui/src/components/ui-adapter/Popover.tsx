import * as React from 'react'
import {
  Popover as ShadcnPopover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { cn } from '../../lib/utils'
import { EDITOR_CLASS } from '../../styles/editorClassNames'

type PopoverPosition =
  | 'top'
  | 'tl'
  | 'tr'
  | 'bottom'
  | 'bl'
  | 'br'
  | 'left'
  | 'lt'
  | 'lb'
  | 'right'
  | 'rt'
  | 'rb'

type TriggerType = 'hover' | 'click' | 'focus'

export interface PopoverProps {
  children?: React.ReactNode
  content?: React.ReactNode
  title?: React.ReactNode
  position?: PopoverPosition
  trigger?: TriggerType | TriggerType[]
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  defaultPopupVisible?: boolean
  popupVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  getPopupContainer?: () => HTMLElement
  color?: string
  unmountOnExit?: boolean
  triggerProps?: Record<string, unknown>
}

const positionMapping: Record<PopoverPosition, 'top' | 'bottom' | 'left' | 'right'> = {
  top: 'top',
  tl: 'top',
  tr: 'top',
  bottom: 'bottom',
  bl: 'bottom',
  br: 'bottom',
  left: 'left',
  lt: 'left',
  lb: 'left',
  right: 'right',
  rt: 'right',
  rb: 'right',
}

const alignMapping: Record<PopoverPosition, 'start' | 'center' | 'end'> = {
  top: 'center',
  tl: 'start',
  tr: 'end',
  bottom: 'center',
  bl: 'start',
  br: 'end',
  left: 'center',
  lt: 'start',
  lb: 'end',
  right: 'center',
  rt: 'start',
  rb: 'end',
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  title,
  position = 'top',
  trigger,
  disabled,
  className,
  style,
  popupVisible,
  defaultPopupVisible,
  onVisibleChange,
  getPopupContainer,
}) => {
  if (disabled) {
    return <>{children}</>
  }

  const side = positionMapping[position]
  const align = alignMapping[position]
  const popupContainer = getPopupContainer?.()

  return (
    <ShadcnPopover
      open={popupVisible}
      defaultOpen={defaultPopupVisible}
      onOpenChange={onVisibleChange}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        container={popupContainer}
        className={cn(EDITOR_CLASS.popoverContent, 'z-[300] w-auto p-4', className)}
        style={style}
        onOpenAutoFocus={(e) => {
          if (trigger === 'click') {
            e.preventDefault()
          }
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <div className={EDITOR_CLASS.popoverContentInner}>
          {title && (
            <div className="mb-2 font-medium text-sm border-b pb-2">
              {title}
            </div>
          )}
          {content}
        </div>
      </PopoverContent>
    </ShadcnPopover>
  )
}

Popover.displayName = 'Popover'

export default Popover
