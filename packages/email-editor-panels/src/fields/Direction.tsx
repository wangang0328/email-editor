import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx, Stack } from '@wa-dev/email-editor-editor';
import { RadioGroupField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: 'ltr',
    get label() {
      return t`从左到右`;
    },
  },
  {
    value: 'rtl',
    get label() {
      return t`从右到左`;
    },
  },
];

export function Direction({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack>
      <RadioGroupField
        label={t`文字方向`}
        name={`${focusIdx}.attributes.direction`}
        options={options}
        inline
        formItem={formItem}
      />
    </Stack>
  );
}
