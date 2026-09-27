import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx, Stack } from '@wa-dev/email-editor-editor';
import { RadioGroupField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: 'left',
    get label() {
      return t`左侧`;
    },
  },
  {
    value: 'center',
    get label() {
      return t`居中`;
    },
  },
  {
    value: 'right',
    get label() {
      return t`右侧`;
    },
  },
];

export function TextAlign({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack>
      <RadioGroupField
        label={t`文字对齐`}
        name={name || `${focusIdx}.attributes.text-align`}
        options={options}
        formItem={formItem}
      />
    </Stack>
  );
}
