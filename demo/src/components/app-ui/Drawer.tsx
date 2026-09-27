import * as React from 'react'
import { Drawer as VaulDrawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerProps {
  visible?: boolean
  title?: React.ReactNode
  footer?: React.ReactNode
  placement?: DrawerPlacement
  width?: number | string
  height?: number | string
  mask?: boolean
  maskClosable?: boolean
  closable?: boolean
  escToExit?: boolean
  getPopupContainer?: () => HTMLElement
  mountOnEnter?: boolean
  unmountOnExit?: boolean
  headerStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  footerStyle?: React.CSSProperties
  onOk?: () => void
  onCancel?: () => void
  afterOpen?: () => void
  afterClose?: () => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({
  visible = false,
  title,
  footer,
  placement = 'right',
  width = 250,
  height = 250,
  mask = true,
  maskClosable = true,
  closable = true,
  onCancel,
  afterOpen,
  afterClose,
  headerStyle,
  bodyStyle,
  footerStyle,
  className,
  style,
  children,
}) => {
  const directionMap: Record<DrawerPlacement, 'top' | 'right' | 'bottom' | 'left'> = {
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
  }

  const isHorizontal = placement === 'left' || placement === 'right'
  const size = isHorizontal ? width : height

  const handleOpenChange = (open: boolean) => {
    if (open) {
      afterOpen?.()
    } else {
      onCancel?.()
      afterClose?.()
    }
  }

  return (
    <VaulDrawer.Root
      open={visible}
      onOpenChange={handleOpenChange}
      direction={directionMap[placement]}
      modal={mask}
    >
      <VaulDrawer.Portal>
        {mask && (
          <VaulDrawer.Overlay
            className="fixed inset-0 bg-black/40 z-50"
            onClick={maskClosable ? onCancel : undefined}
          />
        )}
        <VaulDrawer.Content
          className={cn(
            'fixed z-50 bg-background flex flex-col',
            placement === 'right' && 'right-0 top-0 bottom-0 rounded-l-lg',
            placement === 'left' && 'left-0 top-0 bottom-0 rounded-r-lg',
            placement === 'top' && 'top-0 left-0 right-0 rounded-b-lg',
            placement === 'bottom' && 'bottom-0 left-0 right-0 rounded-t-lg',
            className
          )}
          style={{
            ...style,
            width: isHorizontal ? (typeof size === 'number' ? `${size}px` : size) : '100%',
            height: !isHorizontal ? (typeof size === 'number' ? `${size}px` : size) : '100%',
          }}
        >
          {(title || closable) && (
            <div
              className="flex items-center justify-between p-4 border-b"
              style={headerStyle}
            >
              <VaulDrawer.Title className="text-lg font-semibold">
                {title}
              </VaulDrawer.Title>
              {closable && (
                <button
                  onClick={onCancel}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-auto p-4" style={bodyStyle}>
            {children}
          </div>

          {footer && (
            <div className="p-4 border-t" style={footerStyle}>
              {footer}
            </div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}

Drawer.displayName = 'Drawer'

export default Drawer
