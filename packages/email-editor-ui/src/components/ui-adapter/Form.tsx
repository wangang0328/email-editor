import * as React from 'react'
import { cn } from '../../lib/utils'

type FormLayout = 'horizontal' | 'vertical' | 'inline'
type FormSize = 'mini' | 'small' | 'default' | 'large'
type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'
/** 与 Arco Form 对齐：left/right 为水平布局下的文字对齐；top 为标签在控件上方 */
export type FormLabelAlign = 'left' | 'right' | 'top'

export interface FormProps {
  layout?: FormLayout
  size?: FormSize
  labelCol?: { span?: number; offset?: number; style?: React.CSSProperties }
  wrapperCol?: { span?: number; offset?: number; style?: React.CSSProperties }
  labelAlign?: FormLabelAlign
  requiredSymbol?: boolean | { position: 'start' | 'end' }
  colon?: boolean | string
  disabled?: boolean
  scrollToFirstError?: boolean | { behavior: 'smooth' | 'auto' }
  initialValues?: Record<string, unknown>
  validateMessages?: Record<string, string>
  validateTrigger?: string | string[]
  onSubmit?: (e: React.FormEvent) => void
  onChange?: (value: Record<string, unknown>, values: Record<string, unknown>) => void
  onValuesChange?: (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Form: React.FC<FormProps> & {
  Item: typeof FormItem
  List: typeof FormList
  useForm: typeof useForm
  Provider: typeof FormProvider
} = ({
  layout = 'horizontal',
  disabled,
  onSubmit,
  className,
  style,
  children,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'space-y-4',
        layout === 'inline' && 'flex flex-wrap gap-4 space-y-0',
        layout === 'horizontal' && 'grid',
        className
      )}
      style={style}
    >
      <fieldset disabled={disabled} className="contents">
        {children}
      </fieldset>
    </form>
  )
}

export interface FormItemProps {
  label?: React.ReactNode
  required?: boolean
  hidden?: boolean
  colon?: boolean
  noStyle?: boolean
  disabled?: boolean
  rules?: Array<{
    required?: boolean
    message?: string
    pattern?: RegExp
    min?: number
    max?: number
    validator?: (value: unknown, callback: (error?: string) => void) => void
  }>
  validateStatus?: ValidateStatus
  help?: React.ReactNode
  extra?: React.ReactNode
  labelCol?: { span?: number; offset?: number; style?: React.CSSProperties }
  wrapperCol?: { span?: number; offset?: number; style?: React.CSSProperties }
  labelAlign?: FormLabelAlign
  initialValue?: unknown
  field?: string
  triggerPropName?: string
  trigger?: string
  validateTrigger?: string | string[]
  dependencies?: string[]
  shouldUpdate?: boolean | ((prevValues: Record<string, unknown>, nextValues: Record<string, unknown>) => boolean)
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

type FormItemLayoutKind = 'label-top' | 'column' | 'stack'

function getFormItemLayoutKind(
  hasLabel: boolean,
  labelAlignTop: boolean,
  hasColumnLayout: boolean,
): FormItemLayoutKind {
  if (labelAlignTop && hasLabel) return 'label-top'
  if (hasColumnLayout) return 'column'
  return 'stack'
}

/** 静态布局用 Tailwind；labelSpan / wrapperOffset 的百分比为运行时值，保留内联 style（JIT 无法扫描动态 class） */
function getFormItemLayoutParts(
  kind: FormItemLayoutKind,
  options: {
    style?: React.CSSProperties
    labelTextAlign: 'left' | 'right'
    labelSpan: number
    wrapperOffset: number
    labelColStyle?: React.CSSProperties
    wrapperColStyle?: React.CSSProperties
  },
): {
  containerClassName: string
  labelClassName: string
  wrapperClassName: string
  containerStyle: React.CSSProperties
  labelStyle: React.CSSProperties
  wrapperStyle: React.CSSProperties
} {
  const {
    style,
    labelTextAlign,
    labelSpan,
    wrapperOffset,
    labelColStyle,
    wrapperColStyle,
  } = options

  const alignClass = labelTextAlign === 'right' ? 'text-right' : 'text-left'
  const baseLabel = cn(
    'ee-form-item-label text-sm text-[var(--color-text-2,#4e5969)]',
    alignClass,
  )

  const containerStyle: React.CSSProperties = { ...style }
  const labelStyle: React.CSSProperties = { ...(labelColStyle || {}) }
  const wrapperStyle: React.CSSProperties = { ...(wrapperColStyle || {}) }

  switch (kind) {
    case 'label-top':
      return {
        containerClassName:
          'mb-3 box-border flex w-full max-w-full flex-col items-stretch',
        labelClassName: cn(
          baseLabel,
          'mb-1 box-border block w-full max-w-full pr-0 leading-[22px]',
        ),
        wrapperClassName: 'box-border min-w-0 w-full max-w-full',
        containerStyle,
        labelStyle,
        wrapperStyle,
      }
    case 'column': {
      if (wrapperOffset) {
        wrapperStyle.marginLeft = `${(wrapperOffset / 24) * 100}%`
      }
      labelStyle.maxWidth = `${(labelSpan / 24) * 100}%`
      return {
        containerClassName:
          'mb-3 box-border flex w-full max-w-full flex-row flex-nowrap items-start',
        labelClassName: cn(baseLabel, 'box-border pr-2 leading-8'),
        wrapperClassName: 'box-border min-w-0 max-w-full flex-1',
        containerStyle,
        labelStyle,
        wrapperStyle,
      }
    }
    case 'stack':
    default:
      return {
        containerClassName: 'mb-3 box-border w-full max-w-full',
        labelClassName: cn(baseLabel, 'mb-1 box-border block pr-2 leading-8'),
        wrapperClassName: 'box-border w-full',
        containerStyle,
        labelStyle,
        wrapperStyle,
      }
  }
}

export const FormItem: React.FC<FormItemProps> = ({
  label,
  required,
  hidden,
  noStyle,
  validateStatus,
  help,
  extra,
  labelCol,
  wrapperCol,
  labelAlign,
  className,
  style,
  children,
}) => {
  if (hidden) return null

  if (noStyle) {
    return <>{children}</>
  }

  const statusStyles: Record<ValidateStatus, React.CSSProperties> = {
    success: { color: '#00b42a' },
    warning: { color: '#ff7d00' },
    error: { color: '#f53f3f' },
    validating: { color: '#165dff' },
  }

  const isLabelTop = labelAlign === 'top'
  /** top 时改为上下结构，不再与 wrapper 并排分栏 */
  const hasColumnLayout =
    Boolean(labelCol || wrapperCol) && Boolean(label) && !isLabelTop

  const labelSpan = labelCol?.span ?? 24
  const wrapperOffset = wrapperCol?.offset ?? 0

  /** CSS textAlign 只能是 left/right，不能把 'top' 传进去 */
  const labelTextAlign: 'left' | 'right' =
    labelAlign === 'right' ? 'right' : 'left'

  const layoutKind = getFormItemLayoutKind(
    Boolean(label),
    isLabelTop,
    hasColumnLayout,
  )

  const {
    containerClassName,
    labelClassName,
    wrapperClassName,
    containerStyle,
    labelStyle,
    wrapperStyle,
  } = getFormItemLayoutParts(layoutKind, {
    style,
    labelTextAlign,
    labelSpan,
    wrapperOffset,
    labelColStyle: labelCol?.style,
    wrapperColStyle: wrapperCol?.style,
  })

  return (
    <div
      className={cn(containerClassName, className)}
      style={containerStyle}
    >
      {label && (
        <div className={labelClassName} style={labelStyle}>
          {required && (
            <span className="mr-1 text-[#f53f3f]">*</span>
          )}
          {label}
        </div>
      )}
      <div className={wrapperClassName} style={wrapperStyle}>
        {children}
      </div>
      {help && (
        <p
          style={{
            width: '100%',
            marginTop: '4px',
            fontSize: '12px',
            ...(validateStatus ? statusStyles[validateStatus] : { color: 'var(--color-text-3, #86909c)' }),
          }}
        >
          {help}
        </p>
      )}
      {extra && (
        <p style={{ width: '100%', marginTop: '4px', fontSize: '12px', color: 'var(--color-text-3, #86909c)' }}>{extra}</p>
      )}
    </div>
  )
}

export interface FormListProps {
  field?: string
  children?: (
    fields: Array<{ key: number; field: string }>,
    operation: {
      add: (defaultValue?: unknown, index?: number) => void
      remove: (index: number | number[]) => void
      move: (from: number, to: number) => void
    }
  ) => React.ReactNode
  initialValue?: unknown[]
  rules?: Array<{
    required?: boolean
    message?: string
    validator?: (value: unknown[], callback: (error?: string) => void) => void
  }>
}

export const FormList: React.FC<FormListProps> = ({
  children,
}) => {
  const [fields, setFields] = React.useState<Array<{ key: number; field: string }>>([])
  const keyRef = React.useRef(0)

  const operation = {
    add: (defaultValue?: unknown, index?: number) => {
      const newField = { key: keyRef.current++, field: `field_${keyRef.current}` }
      if (index !== undefined) {
        setFields((prev) => {
          const next = [...prev]
          next.splice(index, 0, newField)
          return next
        })
      } else {
        setFields((prev) => [...prev, newField])
      }
    },
    remove: (index: number | number[]) => {
      const indices = Array.isArray(index) ? index : [index]
      setFields((prev) => prev.filter((_, i) => !indices.includes(i)))
    },
    move: (from: number, to: number) => {
      setFields((prev) => {
        const next = [...prev]
        const [removed] = next.splice(from, 1)
        next.splice(to, 0, removed)
        return next
      })
    },
  }

  return <>{children?.(fields, operation)}</>
}

export interface FormInstance<T = unknown> {
  getFieldValue: (field: string) => unknown
  getFieldsValue: (fields?: string[]) => T
  setFieldValue: (field: string, value: unknown) => void
  setFieldsValue: (values: Partial<T>) => void
  resetFields: (fields?: string[]) => void
  validate: (fields?: string[]) => Promise<T>
  submit: () => void
  clearFields: (fields?: string[]) => void
  getFieldError: (field: string) => string[]
  getFieldsError: (fields?: string[]) => Record<string, string[]>
  scrollToField: (field: string, options?: ScrollIntoViewOptions) => void
}

export function useForm<T = unknown>(): [FormInstance<T>] {
  const formInstance: FormInstance<T> = {
    getFieldValue: () => undefined,
    getFieldsValue: () => ({} as T),
    setFieldValue: () => {},
    setFieldsValue: () => {},
    resetFields: () => {},
    validate: () => Promise.resolve({} as T),
    submit: () => {},
    clearFields: () => {},
    getFieldError: () => [],
    getFieldsError: () => ({}),
    scrollToField: () => {},
  }

  return [formInstance]
}

export interface FormProviderProps {
  children?: React.ReactNode
  onFormChange?: (name: string, info: { changedFields: unknown[]; forms: Record<string, FormInstance> }) => void
  onFormSubmit?: (name: string, info: { values: unknown; forms: Record<string, FormInstance> }) => void
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  return <>{children}</>
}

Form.Item = FormItem
Form.List = FormList
Form.useForm = useForm
Form.Provider = FormProvider

Form.displayName = 'Form'
FormItem.displayName = 'Form.Item'
FormList.displayName = 'Form.List'
FormProvider.displayName = 'Form.Provider'

export default Form
