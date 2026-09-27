import * as React from 'react'
import { cn } from '../../lib/utils'

export interface TypographyProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface TitleProps extends TypographyProps {
  heading?: 1 | 2 | 3 | 4 | 5 | 6
  ellipsis?: boolean | { rows?: number }
}

export interface TextProps extends TypographyProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  bold?: boolean
  disabled?: boolean
  mark?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  ellipsis?: boolean | { rows?: number }
}

export interface ParagraphProps extends TypographyProps {
  ellipsis?: boolean | { rows?: number }
  spacing?: 'default' | 'close'
}

const Title: React.FC<TitleProps> = ({
  heading = 1,
  ellipsis,
  className,
  style,
  children,
}) => {
  const Tag = `h${heading}` as keyof React.JSX.IntrinsicElements
  
  const headingClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-bold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-semibold',
    6: 'text-base font-semibold',
  }
  
  return React.createElement(
    Tag,
    {
      className: cn(
        headingClasses[heading],
        ellipsis && 'truncate',
        className
      ),
      style,
    },
    children
  )
}

const Text: React.FC<TextProps> = ({
  type,
  bold,
  disabled,
  mark,
  underline,
  delete: del,
  code,
  ellipsis,
  className,
  style,
  children,
}) => {
  const typeClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  }
  
  let content: React.ReactNode = children
  
  if (code) {
    content = (
      <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
        {content}
      </code>
    )
  }
  
  if (mark) {
    content = <mark className="bg-yellow-200 px-0.5">{content}</mark>
  }
  
  if (del) {
    content = <del>{content}</del>
  }
  
  if (underline) {
    content = <u>{content}</u>
  }
  
  return (
    <span
      className={cn(
        type && typeClasses[type],
        bold && 'font-bold',
        disabled && 'opacity-50 cursor-not-allowed',
        ellipsis && 'truncate inline-block max-w-full',
        className
      )}
      style={style}
    >
      {content}
    </span>
  )
}

const Paragraph: React.FC<ParagraphProps> = ({
  ellipsis,
  spacing = 'default',
  className,
  style,
  children,
}) => {
  return (
    <p
      className={cn(
        spacing === 'default' && 'mb-4',
        spacing === 'close' && 'mb-2',
        ellipsis && 'line-clamp-3',
        className
      )}
      style={style}
    >
      {children}
    </p>
  )
}

export const Typography: React.FC<TypographyProps> & {
  Title: typeof Title
  Text: typeof Text
  Paragraph: typeof Paragraph
} = ({ className, style, children }) => {
  return (
    <article className={cn('prose', className)} style={style}>
      {children}
    </article>
  )
}

Typography.Title = Title
Typography.Text = Text
Typography.Paragraph = Paragraph

Typography.displayName = 'Typography'
Title.displayName = 'Typography.Title'
Text.displayName = 'Typography.Text'
Paragraph.displayName = 'Typography.Paragraph'

export default Typography
