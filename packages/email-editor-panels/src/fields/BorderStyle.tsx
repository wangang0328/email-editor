import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { SelectField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

export const borderStyleOptions = [
  {
    value: 'solid',
    get label() {
      return t`实线`;
    },
  },
  {
    value: 'dashed',
    get label() {
      return t`虚线`;
    },
  },
  {
    value: 'dotted',
    get label() {
      return t`点线`;
    },
  },
];

export function BorderStyle({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <SelectField
      label={t`样式`}
      name={`${focusIdx}.attributes.border-style`}
      options={borderStyleOptions}
      dropdownMenuStyle={{ zIndex: 1050 }}
      formItem={formItem}
    />
  );
}
