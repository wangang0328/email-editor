import * as React from 'react'
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { cn } from '../../lib/utils'

type TooltipPosition =
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

export interface TooltipProps {
  children?: React.ReactNode
  content?: React.ReactNode
  title?: React.ReactNode
  position?: TooltipPosition
  trigger?: TriggerType | TriggerType[]
  disabled?: boolean
  mini?: boolean
  color?: string
  className?: string
  style?: React.CSSProperties
  defaultPopupVisible?: boolean
  popupVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  getPopupContainer?: () => HTMLElement
  unmountOnExit?: boolean
  blurToHide?: boolean
}

const positionMapping: Record<TooltipPosition, 'top' | 'bottom' | 'left' | 'right'> = {
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

const alignMapping: Record<TooltipPosition, 'start' | 'center' | 'end'> = {
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

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  title,
  position = 'top',
  disabled,
  mini,
  color,
  className,
  style,
  popupVisible,
  onVisibleChange,
}) => {
  const tooltipContent = content || title

  if (disabled || !tooltipContent) {
    return <>{children}</>
  }

  const side = positionMapping[position]
  const align = alignMapping[position]

  return (
    <TooltipProvider delayDuration={100}>
      <ShadcnTooltip
        open={popupVisible}
        onOpenChange={onVisibleChange}
      >
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            mini && 'px-2 py-1 text-xs',
            className
          )}
          style={{
            ...style,
            ...(color && { backgroundColor: color, borderColor: color }),
          }}
        >
          {tooltipContent}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  )
}

Tooltip.displayName = 'Tooltip'

export default Tooltip
