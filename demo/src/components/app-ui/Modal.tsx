import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from './Button'
import { cn } from '../../lib/utils'

export interface ModalProps {
  visible?: boolean
  title?: React.ReactNode
  footer?: React.ReactNode | null
  okText?: string
  cancelText?: string
  okButtonProps?: Record<string, unknown>
  cancelButtonProps?: Record<string, unknown>
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  maskStyle?: React.CSSProperties
  simple?: boolean
  confirmLoading?: boolean
  mountOnEnter?: boolean
  unmountOnExit?: boolean
  escToExit?: boolean
  focusLock?: boolean
  autoFocus?: boolean
  getPopupContainer?: () => HTMLElement
  getChildrenPopupContainer?: () => HTMLElement
  wrapClassName?: string
  modalRender?: (node: React.ReactNode) => React.ReactNode
  afterOpen?: () => void
  afterClose?: () => void
  onOk?: (e?: React.MouseEvent) => void | Promise<void>
  onCancel?: (e?: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  visible = false,
  title,
  footer,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  closable = true,
  maskClosable = true,
  simple = false,
  confirmLoading = false,
  afterOpen,
  afterClose,
  onOk,
  onCancel,
  className,
  style,
  children,
}) => {
  React.useEffect(() => {
    if (visible) {
      afterOpen?.()
    }
  }, [visible, afterOpen])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel?.()
      afterClose?.()
    }
  }

  const handleOk = async (e: React.MouseEvent) => {
    await onOk?.(e)
  }

  const renderFooter = () => {
    if (footer === null) {
      return null
    }

    if (footer !== undefined) {
      return <DialogFooter>{footer}</DialogFooter>
    }

    return (
      <DialogFooter>
        <Button
          type="outline"
          onClick={onCancel}
          {...cancelButtonProps}
        >
          {cancelText}
        </Button>
        <Button
          type="primary"
          loading={confirmLoading}
          onClick={handleOk}
          {...okButtonProps}
        >
          {okText}
        </Button>
      </DialogFooter>
    )
  }

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(className)}
        style={style}
        onPointerDownOutside={(e) => {
          if (!maskClosable) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closable) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className={cn((!title || simple) && 'sr-only')}>
          <DialogTitle>{title ?? 'Dialog'}</DialogTitle>
        </DialogHeader>
        <div className={cn(!simple && 'py-4')}>{children}</div>
        {renderFooter()}
      </DialogContent>
    </Dialog>
  )
}

Modal.displayName = 'Modal'

export default Modal
