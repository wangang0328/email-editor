import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { InputWithUnitField } from '@panels/form';
import { pixelAdapter } from '../shared/adapter';
import type { AttributeFormItemProps } from './types';

export function FontSize({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={t`字号`}
      name={`${focusIdx}.attributes.font-size`}
      config={pixelAdapter}
      autoComplete='off'
      formItem={formItem}
      suffix="px"
      type='number'
    />
  );
}
