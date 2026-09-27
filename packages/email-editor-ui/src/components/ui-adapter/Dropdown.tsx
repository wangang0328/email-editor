import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

type TriggerType = 'hover' | 'click' | 'contextMenu'
type DropdownPosition = 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br'

export interface DropdownMenuItem {
  key: string
  title?: React.ReactNode
  disabled?: boolean
  children?: DropdownMenuItem[]
}

export interface DropdownProps {
  droplist?: React.ReactElement
  position?: DropdownPosition
  trigger?: TriggerType | TriggerType[]
  disabled?: boolean
  unmountOnExit?: boolean
  defaultPopupVisible?: boolean
  popupVisible?: boolean
  triggerProps?: Record<string, unknown>
  getPopupContainer?: () => HTMLElement
  onVisibleChange?: (visible: boolean) => void
  className?: string
  children?: React.ReactNode
}

const positionMapping: Record<DropdownPosition, 'top' | 'bottom'> = {
  top: 'top',
  tl: 'top',
  tr: 'top',
  bottom: 'bottom',
  bl: 'bottom',
  br: 'bottom',
}

const alignMapping: Record<DropdownPosition, 'start' | 'center' | 'end'> = {
  top: 'center',
  tl: 'start',
  tr: 'end',
  bottom: 'center',
  bl: 'start',
  br: 'end',
}

export const Dropdown: React.FC<DropdownProps> = ({
  droplist,
  position = 'bl',
  trigger = 'hover',
  disabled,
  popupVisible,
  onVisibleChange,
  className,
  children,
}) => {
  if (disabled) {
    return <>{children}</>
  }

  const side = positionMapping[position]
  const align = alignMapping[position]

  return (
    <DropdownMenu
      open={popupVisible}
      onOpenChange={onVisibleChange}
    >
      <DropdownMenuTrigger asChild className={className}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align}>
        {droplist}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

Dropdown.displayName = 'Dropdown'

export interface MenuProps {
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  onClickMenuItem?: (key: string, event: React.MouseEvent, keyPath: string[]) => void
  onClickSubMenu?: (key: string, openKeys: string[], keyPath: string[]) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const MenuComponent: React.FC<MenuProps> = ({
  onClickMenuItem,
  className,
  style,
  children,
}) => {
  return (
    <div className={cn('py-1', className)} style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<MenuItemProps>, {
            onClickMenuItem,
          })
        }
        return child
      })}
    </div>
  )
}

MenuComponent.displayName = 'Menu'

export interface MenuItemProps {
  key?: string
  disabled?: boolean
  onClickMenuItem?: (key: string, event: React.MouseEvent, keyPath: string[]) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = ({
  key: itemKey,
  disabled,
  onClickMenuItem,
  className,
  style,
  children,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    if (itemKey && onClickMenuItem) {
      onClickMenuItem(itemKey, event, [itemKey])
    }
  }

  return (
    <DropdownMenuItem
      disabled={disabled}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </DropdownMenuItem>
  )
}

MenuItem.displayName = 'MenuItem'

export interface SubMenuProps {
  key?: string
  title?: React.ReactNode
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const SubMenu: React.FC<SubMenuProps> = ({
  title,
  disabled,
  className,
  children,
}) => {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled} className={className}>
        {title}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {children}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

SubMenu.displayName = 'SubMenu'

export const Menu = Object.assign(MenuComponent, {
  Item: MenuItem,
  SubMenu,
})

export { DropdownMenuSeparator as Divider }

export default Dropdown
