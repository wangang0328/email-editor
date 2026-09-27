import { t } from '@lingui/core/macro';
import { Italic, Type } from 'lucide-react';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { RadioGroupField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const fontStyleOptions = [
  {
    value: 'normal',
    label: <Type className="mx-auto h-4 w-4" aria-hidden />,
  },
  {
    value: 'italic',
    label: <Italic className="mx-auto h-4 w-4" aria-hidden />,
  },
];

export function FontStyle({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <RadioGroupField
      label={t`字体样式`}
      name={name || `${focusIdx}.attributes.font-style`}
      type="button"
      options={fontStyleOptions}
      formItem={{
        labelAlign: 'top',
        ...formItem,
      }}
      className="ee-icon-radio-group"
      style={{ width: '100%' }}
    />
  );
}
