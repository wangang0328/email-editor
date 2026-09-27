import * as React from 'react'
import { TooltipProvider } from '../ui/tooltip'
import { cn } from '../../lib/utils'

export type ThemeMode = 'light' | 'dark'

/** 可覆盖的编辑器主题 token（映射到 CSS 变量） */
export interface EmailEditorThemeTokens {
  colorPrimary?: string
  panelBg?: string
  panelBorder?: string
  canvasBg?: string
  colorText1?: string
  colorText2?: string
  colorText3?: string
  colorBg2?: string
  colorFill1?: string
  colorFill2?: string
  colorFill3?: string
  colorBorder2?: string
}

export interface EmailEditorTheme {
  /** 亮色 / 暗色；暗色会挂 `dark` class，并切换内置暗色 token */
  mode?: ThemeMode
  /** 主题色快捷写法，等价于 token.colorPrimary */
  primaryColor?: string
  token?: EmailEditorThemeTokens
}

export interface ConfigProviderProps {
  children?: React.ReactNode
  locale?: Record<string, unknown>
  prefixCls?: string
  size?: 'mini' | 'small' | 'default' | 'large'
  componentConfig?: Record<string, unknown>
  /** 主题配置；也兼容历史 Record 透传 */
  theme?: EmailEditorTheme | Record<string, unknown>
  tablePagination?: Record<string, unknown>
  getPopupContainer?: () => HTMLElement
  focusLock?: {
    modal?: boolean
    drawer?: boolean
  }
  zIndex?: Record<string, number>
  className?: string
  style?: React.CSSProperties
}

function isEmailEditorTheme(
  theme: EmailEditorTheme | Record<string, unknown> | undefined,
): theme is EmailEditorTheme {
  if (!theme || typeof theme !== 'object') return false
  return (
    'mode' in theme ||
    'primaryColor' in theme ||
    'token' in theme
  )
}

/** #RRGGBB → "H S% L%"（供 hsl(var(--primary)) 使用） */
function hexToHslChannels(hex: string): string | null {
  const raw = hex.trim().replace('#', '')
  if (!/^[\da-fA-F]{6}$/.test(raw)) return null
  const r = parseInt(raw.slice(0, 2), 16) / 255
  const g = parseInt(raw.slice(2, 4), 16) / 255
  const b = parseInt(raw.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function resolveThemeStyle(
  theme: EmailEditorTheme | Record<string, unknown> | undefined,
): { mode: ThemeMode; style: React.CSSProperties } {
  if (!isEmailEditorTheme(theme)) {
    return { mode: 'light', style: {} }
  }

  const mode: ThemeMode = theme.mode === 'dark' ? 'dark' : 'light'
  const token = theme.token ?? {}
  const primary = theme.primaryColor || token.colorPrimary
  const style: React.CSSProperties = {}

  const setVar = (name: string, value?: string) => {
    if (value) {
      ;(style as Record<string, string>)[name] = value
    }
  }

  if (primary) {
    setVar('--color-primary', primary)
    const hsl = hexToHslChannels(primary)
    if (hsl) {
      setVar('--primary', hsl)
      setVar('--ring', hsl)
    }
  }

  setVar('--ee-panel-bg', token.panelBg)
  setVar('--ee-panel-border', token.panelBorder)
  setVar('--ee-canvas-bg', token.canvasBg)
  setVar('--color-text-1', token.colorText1)
  setVar('--color-text-2', token.colorText2)
  setVar('--color-text-3', token.colorText3)
  setVar('--color-bg-2', token.colorBg2)
  setVar('--color-fill-1', token.colorFill1)
  setVar('--color-fill-2', token.colorFill2)
  setVar('--color-fill-3', token.colorFill3)
  setVar('--color-border-2', token.colorBorder2)

  return { mode, style }
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  theme,
  className,
  style,
}) => {
  const { mode, style: themeStyle } = React.useMemo(
    () => resolveThemeStyle(theme),
    [theme],
  )

  return (
    <div
      data-email-editor-theme={mode}
      className={cn(
        'email-editor-theme-root h-full min-h-0 w-full',
        mode === 'dark' && 'dark',
        className,
      )}
      style={{ ...themeStyle, ...style }}
    >
      <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
    </div>
  )
}

ConfigProvider.displayName = 'ConfigProvider'

export default ConfigProvider
