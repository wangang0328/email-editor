import { Radio } from '@wa-dev/email-editor-ui';
import type { RadioGroupProps as ArcoRadioGroupProps } from '@wa-dev/email-editor-ui';
import { merge } from 'lodash-es';
import React from 'react';
import { Stack } from '@wa-dev/email-editor-editor';

export interface RadioGroupProps extends ArcoRadioGroupProps {
  options: Array<{ value: string; label: React.ReactNode }>;
  onChange?: (value: string) => void;
  value?: string;
  type?: 'radio' | 'button';
  vertical?: boolean;
}

export function RadioGroup(props: RadioGroupProps) {
  const { type, vertical, options, ...rest } = props;

  if (type === 'button') {
    return (
      <Radio.Group
        {...rest}
        type="button"
        options={options}
        direction={vertical ? 'vertical' : 'horizontal'}
        style={merge({ width: '100%' }, rest.style)}
        value={rest.value}
        onChange={rest.onChange}
      />
    );
  }

  return (
    <Radio.Group
      {...rest}
      type={type}
      style={merge({ width: '100%' }, rest.style)}
      value={rest.value}
      onChange={rest.onChange}
    >
      <Stack vertical={vertical} spacing='extraTight' className='flex items-center gap-4 m-0'>
        {options.map((item, index) => (
          <Radio key={index} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Stack>
    </Radio.Group>
  );
}
