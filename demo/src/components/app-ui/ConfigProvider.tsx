import * as React from 'react'
import { TooltipProvider } from '../ui/tooltip'

export interface ConfigProviderProps {
  children?: React.ReactNode
  locale?: Record<string, unknown>
  prefixCls?: string
  size?: 'mini' | 'small' | 'default' | 'large'
  componentConfig?: Record<string, unknown>
  theme?: Record<string, unknown>
  tablePagination?: Record<string, unknown>
  getPopupContainer?: () => HTMLElement
  focusLock?: {
    modal?: boolean
    drawer?: boolean
  }
  zIndex?: Record<string, number>
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
}) => {
  return (
    <TooltipProvider delayDuration={100}>
      {children}
    </TooltipProvider>
  )
}

ConfigProvider.displayName = 'ConfigProvider'

export default ConfigProvider
