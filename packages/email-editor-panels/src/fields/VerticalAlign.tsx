import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx, Stack } from '@wa-dev/email-editor-editor';
import { SelectField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: 'top',
    get label() {
      return t`顶部`;
    },
  },
  {
    value: 'middle',
    get label() {
      return t`居中`;
    },
  },
  {
    value: 'bottom',
    get label() {
      return t`底部`;
    },
  },
];

export function VerticalAlign({
  attributeName = 'vertical-align',
  formItem,
}: AttributeFormItemProps & {
  attributeName?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack>
      <SelectField
        style={{ width: 120 }}
        label={t`垂直对齐`}
        name={`${focusIdx}.attributes.${attributeName}`}
        options={options}
        formItem={formItem}
      />
    </Stack>
  );
}
