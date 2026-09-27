import { t } from '@lingui/core/macro';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { RadioGroupField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

const alignOptions = [
  {
    value: 'left',
    label: <AlignLeft className="mx-auto h-4 w-4" aria-hidden />,
  },
  {
    value: 'center',
    label: <AlignCenter className="mx-auto h-4 w-4" aria-hidden />,
  },
  {
    value: 'right',
    label: <AlignRight className="mx-auto h-4 w-4" aria-hidden />,
  },
];

export function Align({
  inline: _inline,
  formItem,
  name,
}: AttributeFormItemProps & { inline?: boolean; name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <RadioGroupField
      label={t`对齐`}
      name={name || `${focusIdx}.attributes.align`}
      type="button"
      options={alignOptions}
      formItem={{
        labelAlign: 'top',
        ...formItem,
      }}
      className="ee-align-radio-group"
      style={{ width: '100%' }}
    />
  );
}
