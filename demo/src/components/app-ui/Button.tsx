import * as React from 'react'
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '../ui/button'
import { cn } from '../../lib/utils'

type ArcoButtonType = 'default' | 'primary' | 'secondary' | 'dashed' | 'text' | 'outline'
type ArcoButtonSize = 'mini' | 'small' | 'default' | 'large'
type ArcoButtonShape = 'circle' | 'round' | 'square'
type ArcoButtonStatus = 'warning' | 'danger' | 'success' | 'default'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ArcoButtonType
  size?: ArcoButtonSize
  shape?: ArcoButtonShape
  status?: ArcoButtonStatus
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconOnly?: boolean
  long?: boolean
  htmlType?: 'button' | 'submit' | 'reset'
  href?: string
  target?: string
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>
}

const typeMapping: Record<ArcoButtonType, ShadcnButtonProps['variant']> = {
  default: 'outline',
  primary: 'default',
  secondary: 'secondary',
  dashed: 'outline',
  text: 'ghost',
  outline: 'outline',
}

const sizeMapping: Record<ArcoButtonSize, ShadcnButtonProps['size']> = {
  mini: 'mini',
  small: 'sm',
  default: 'default',
  large: 'lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'default',
      size = 'default',
      shape,
      status,
      loading,
      disabled,
      icon,
      iconOnly,
      long,
      htmlType = 'button',
      href,
      target,
      anchorProps,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variant = status === 'danger' ? 'destructive' : typeMapping[type]
    const sizeValue = iconOnly ? 'icon' : sizeMapping[size]

    const buttonContent = (
      <>
        {icon && <span className={cn('shrink-0', children && 'mr-1')}>{icon}</span>}
        {children}
      </>
    )

    const buttonClassName = cn(
      long && 'w-full',
      shape === 'circle' && 'rounded-full',
      shape === 'round' && 'rounded-full',
      type === 'dashed' && 'border-dashed',
      status === 'success' && 'bg-green-600 hover:bg-green-700 text-white',
      status === 'warning' && 'bg-yellow-500 hover:bg-yellow-600 text-white',
      className
    )

    if (href) {
      return (
        <a
          href={href}
          target={target}
          {...anchorProps}
          className={cn(
            'inline-flex items-center justify-center',
            buttonClassName
          )}
        >
          <ShadcnButton
            variant={variant}
            size={sizeValue}
            loading={loading}
            disabled={disabled}
            type={htmlType}
            className="pointer-events-none"
            asChild
          >
            <span>{buttonContent}</span>
          </ShadcnButton>
        </a>
      )
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={sizeValue}
        loading={loading}
        disabled={disabled}
        type={htmlType}
        className={buttonClassName}
        {...props}
      >
        {buttonContent}
      </ShadcnButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
