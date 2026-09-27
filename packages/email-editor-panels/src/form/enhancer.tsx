import { Form } from '@wa-dev/email-editor-ui';
import { Field, FieldRenderProps, UseFieldConfig } from 'react-final-form';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useMemo, useState } from 'react';
import { useRefState } from '@wa-dev/email-editor-editor';
import { debounce } from 'lodash-es';
import type { FormItemProps } from '@wa-dev/email-editor-ui';

export interface EnhancerProps {
  name: string;
  onChangeAdapter?: (value: any) => any;
  validate?: (value: any) => string | undefined | Promise<string | undefined>;
  config?: UseFieldConfig<any, any>;
  changeOnBlur?: boolean;
  formItem?: FormItemProps;
  label?: FormItemProps['label'];
  inline?: boolean;
  equalSpacing?: boolean;
  required?: boolean;
  autoComplete?: 'on' | 'off';
  style?: React.CSSProperties;
  helpText?: React.ReactNode;
  debounceTime?: number;
  labelHidden?: boolean;
}

const parse = (v: any) => v;

type EnhancerFieldContentProps<P extends { onChange?: (...rest: any) => any }> = {
  Component: React.FC<any>;
  changeAdapter: (args: Parameters<NonNullable<P['onChange']>>) => any;
  componentProps: Record<string, unknown>;
  name: string;
  debounceTime: number;
  isImmediate: boolean;
  changeOnBlur?: boolean;
  onChangeAdapter?: (value: any) => any;
  formItem?: FormItemProps;
  label?: FormItemProps['label'];
  labelHidden?: boolean;
  required?: boolean;
  style?: React.CSSProperties;
  helpText?: React.ReactNode;
  autoComplete?: 'on' | 'off';
  layoutStyle: FormItemProps;
  input: FieldRenderProps<any, HTMLElement>['input'];
  meta: FieldRenderProps<any, HTMLElement>['meta'];
};

function EnhancerFieldContent<P extends { onChange?: (...rest: any) => any }>({
  Component,
  changeAdapter,
  componentProps,
  name,
  debounceTime,
  isImmediate,
  changeOnBlur,
  onChangeAdapter,
  formItem,
  label,
  labelHidden,
  required,
  style,
  helpText,
  autoComplete,
  layoutStyle,
  input: { onBlur, onChange, value },
  meta,
}: EnhancerFieldContentProps<P>) {
  const [currentValue, setCurrentValue] = useState('');
  const currentValueRef = useRefState(currentValue);

  const debounceCallbackChange = useMemo(
    () =>
      debounce(
        (val: unknown) => {
          onChange(val);
          onBlur();
        },
        debounceTime,
      ),
    [debounceTime, onChange, onBlur],
  );

  useEffect(() => () => debounceCallbackChange.cancel(), [debounceCallbackChange]);

  const onFieldChange: P['onChange'] = useMemoizedFn((e: any) => {
    const newVal = onChangeAdapter
      ? onChangeAdapter(changeAdapter(e))
      : changeAdapter(e);

    if (!isImmediate) {
      setCurrentValue(newVal);
    }
    if (changeOnBlur) {
      return;
    }
    if (isImmediate) {
      onChange(newVal);
      return;
    }
    debounceCallbackChange(newVal);
  });

  const onFieldBlur = useMemoizedFn(() => {
    if (changeOnBlur) {
      onChange(currentValueRef.current);
      onBlur();
    }
  });

  useEffect(() => {
    if (!isImmediate) {
      setCurrentValue(value ?? '');
    }
  }, [isImmediate, value]);

  return (
    <Form.Item
      style={{
        ...style,
        margin: '0px',
      }}
      rules={required ? [{ required: true }] : undefined}
      labelAlign='top'
      label={labelHidden ? undefined : label || formItem?.label}
      validateStatus={meta.touched && meta.error ? 'error' : undefined}
      help={meta.touched && meta.error ? meta.error : helpText}
      {...layoutStyle}
      {...formItem}
    >
      <Component
        autoComplete={autoComplete}
        {...componentProps}
        name={name}
        checked={currentValue}
        value={isImmediate ? (value ?? '') : currentValue}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
      />
    </Form.Item>
  );
}

export default function enhancer<P extends { onChange?: (...rest: any) => any }>(
  Component: React.FC<any>,
  changeAdapter: (args: Parameters<NonNullable<P['onChange']>>) => any,
  option?: { debounceTime: number },
) {
  return (props: EnhancerProps & Omit<P, 'value' | 'onChange' | 'mutators'>) => {
    const {
      name,
      validate,
      onChangeAdapter,
      changeOnBlur,
      inline,
      equalSpacing,
      formItem,
      label,
      required,
      style,
      helpText,
      autoComplete,
      labelHidden,
      config: configFromProps,
      debounceTime: debounceTimeFromProps,
      ...componentProps
    } = props;

    const debounceTime = debounceTimeFromProps ?? option?.debounceTime ?? 300;
    const isImmediate = debounceTime === 0;

    const config = useMemo(
      () => ({
        ...configFromProps,
        validate,
        parse: configFromProps?.parse || parse,
      }),
      [configFromProps, validate],
    );

    const layoutStyle = useMemo((): FormItemProps => {
      if (equalSpacing) {
        return {
          labelCol: {
            span: 11,
            style: {
              textAlign: 'left',
            },
          },
          wrapperCol: {
            span: 11,
            offset: 1,
            style: {
              textAlign: 'right',
            },
          },
        };
      }
      if (inline) {
        return {
          labelCol: {
            span: 7,
            style: {
              textAlign: 'right',
            },
          },
          wrapperCol: {
            span: 16,
            offset: 1,
            style: {},
          },
        };
      }

      return {
        labelCol: {
          span: 24,
          style: {},
        },
        wrapperCol: {
          span: 24,
        },
      };
    }, [equalSpacing, inline]);

    return (
      <Field
        name={name}
        {...config}
      >
        {fieldProps => (
          <EnhancerFieldContent<P>
            Component={Component}
            changeAdapter={changeAdapter}
            componentProps={componentProps}
            name={name}
            debounceTime={debounceTime}
            isImmediate={isImmediate}
            changeOnBlur={changeOnBlur}
            onChangeAdapter={onChangeAdapter}
            formItem={formItem}
            label={label}
            labelHidden={labelHidden}
            required={required}
            style={style}
            helpText={helpText}
            autoComplete={autoComplete}
            layoutStyle={layoutStyle}
            input={fieldProps.input}
            meta={fieldProps.meta}
          />
        )}
      </Field>
    );
  };
}
