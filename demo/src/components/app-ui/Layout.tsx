import * as React from 'react'
import { cn } from '../../lib/utils'

export interface LayoutProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  hasSider?: boolean
}

export const Layout: React.FC<LayoutProps> & {
  Header: React.FC<LayoutProps>
  Footer: React.FC<LayoutProps>
  Content: React.FC<LayoutProps>
  Sider: React.FC<SiderProps>
} = ({ className, style, children, hasSider }) => {
  return (
    <div
      className={cn('flex flex-row min-h-0', className)}
      style={style}
    >
      {children}
    </div>
  )
}

const Header: React.FC<LayoutProps> = ({ className, style, children }) => {
  return (
    <header
      className={cn('flex-shrink-0', className)}
      style={style}
    >
      {children}
    </header>
  )
}

const Footer: React.FC<LayoutProps> = ({ className, style, children }) => {
  return (
    <footer
      className={cn('flex-shrink-0', className)}
      style={style}
    >
      {children}
    </footer>
  )
}

const Content: React.FC<LayoutProps> = ({ className, style, children }) => {
  return (
    <main
      className={cn('flex-1 min-h-0 overflow-auto', className)}
      style={style}
    >
      {children}
    </main>
  )
}

export interface SiderProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  width?: number | string
  collapsed?: boolean
  collapsedWidth?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
  reverseArrow?: boolean
  breakpoint?: 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
  trigger?: React.ReactNode
  onCollapse?: (collapsed: boolean, type: 'clickTrigger' | 'responsive') => void
  onBreakpoint?: (broken: boolean) => void
}

const Sider: React.FC<SiderProps> = ({
  className,
  style,
  children,
  width = 200,
  collapsed = false,
  collapsedWidth = 48,
}) => {
  const currentWidth = collapsed ? collapsedWidth : width

  return (
    <aside
      className={cn(
        'flex-shrink-0 overflow-hidden transition-all duration-200',
        className
      )}
      style={{
        ...style,
        width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
      }}
    >
      <div className="h-full min-h-0">{children}</div>
    </aside>
  )
}

Layout.Header = Header
Layout.Footer = Footer
Layout.Content = Content
Layout.Sider = Sider

Layout.displayName = 'Layout'
Header.displayName = 'Layout.Header'
Footer.displayName = 'Layout.Footer'
Content.displayName = 'Layout.Content'
Sider.displayName = 'Layout.Sider'

export default Layout
