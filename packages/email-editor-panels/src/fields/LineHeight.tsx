import { t } from '@lingui/core/macro';
import React from 'react';
import { InputWithUnitField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import type { AttributeFormItemProps } from './types';

export function LineHeight({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={t`行高`}
      unitOptions='lineHeight'
      name={name || `${focusIdx}.attributes.line-height`}
      formItem={formItem}
      type='number'
      autoComplete='off'
    />
  );
}
