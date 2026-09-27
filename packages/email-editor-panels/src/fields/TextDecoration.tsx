import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { SelectField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: '',
    get label() {
      return t({ context: 'css.textDecoration.none', message: '无' });
    },
  },
  {
    value: 'underline',
    get label() {
      return t`下划线`;
    },
  },
  {
    value: 'overline',
    get label() {
      return t`上划线`;
    },
  },
  {
    value: 'line-through',
    get label() {
      return t`删除线`;
    },
  },
  {
    value: 'blink',
    get label() {
      return t`闪烁`;
    },
  },
  {
    value: 'inherit',
    get label() {
      return t`继承`;
    },
  },
];

export function TextDecoration({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <SelectField
      label={t`文本装饰`}
      name={name || `${focusIdx}.attributes.text-decoration`}
      options={options}
      formItem={formItem}
    />
  );
}
