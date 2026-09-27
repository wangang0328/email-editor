import { Input as ArcoInput } from '@wa-dev/email-editor-ui';
import type { InputProps as ArcoInputProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';

export interface InputProps extends Omit<ArcoInputProps, 'onChange' | 'value'> {
  quickchange?: boolean;
  /** final-form 可能短暂为 undefined，组件内会规范为 '' 以保持受控 */
  value?: string | null;
  onChange: (val: string) => void;
}

export function Input(props: InputProps) {
  const {
    quickchange,
    value: valueFromProps,
    onKeyDown: onPropsKeyDown,
    onChange: propsOnChange,
    ...restProps
  } = props

  const value =
    valueFromProps === undefined || valueFromProps === null ? '' : valueFromProps

  const onChange = useMemoizedFn((val: string) => {
    propsOnChange(val);
  });

  const onKeyDown = useMemoizedFn((ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (onPropsKeyDown) {
      onPropsKeyDown?.(ev);
    }

    if (quickchange) {
      let step = 0;
      if (ev.key === 'ArrowUp') {
        step = 1;
      }
      if (ev.key === 'ArrowDown') {
        step = -1;
      }

      if (step) {
        if (/^\d+/.test(value)) {
          ev.preventDefault();
          onChange(
            String(value).replace(/^(\d+)/, (_, match) => {
              return (Number(match) + step).toString();
            })
          );
        }
      }
    }
  });

  return (
    <ArcoInput
      {...restProps}
      value={value}
      onChange={(v) => onChange(v)}
      onKeyDown={onKeyDown}
    />
  );
}
