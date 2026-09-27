import { toast, Toaster } from 'sonner'

export interface MessageConfig {
  content: React.ReactNode
  duration?: number
  id?: string
  icon?: React.ReactNode
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
}

type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading'

const showMessage = (type: MessageType, config: MessageConfig | string) => {
  const options = typeof config === 'string' ? { content: config } : config

  const toastOptions = {
    id: options.id,
    duration: options.duration ? options.duration * 1000 : 3000,
    onDismiss: options.onClose,
  }

  switch (type) {
    case 'success':
      return toast.success(options.content, toastOptions)
    case 'error':
      return toast.error(options.content, toastOptions)
    case 'warning':
      return toast.warning(options.content, toastOptions)
    case 'loading':
      return toast.loading(options.content, toastOptions)
    case 'info':
    default:
      return toast.info(options.content, toastOptions)
  }
}

export const Message = {
  info: (config: MessageConfig | string) => showMessage('info', config),
  success: (config: MessageConfig | string) => showMessage('success', config),
  warning: (config: MessageConfig | string) => showMessage('warning', config),
  error: (config: MessageConfig | string) => showMessage('error', config),
  loading: (config: MessageConfig | string) => showMessage('loading', config),
  clear: () => toast.dismiss(),
  config: (options: { maxCount?: number; duration?: number }) => {
    // Sonner doesn't support these options globally, but we can ignore them
  },
}

export { Toaster }

export default Message
