import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { SelectField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: 'initial',
    get label() {
      return t({ context: 'css.textTransform.none', message: '无' });
    },
  },
  {
    value: 'uppercase',
    get label() {
      return t`大写`;
    },
  },
  {
    value: 'lowercase',
    get label() {
      return t`小写`;
    },
  },
  {
    value: 'capitalize',
    get label() {
      return t`首字母大写`;
    },
  },
];

export function TextTransform({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <SelectField
      label={t`文本转换`}
      name={name || `${focusIdx}.attributes.text-transform`}
      options={options}
      formItem={formItem}
    />
  );
}
