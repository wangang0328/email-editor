import { t } from '@lingui/core/macro';
import React from 'react';
import { InputWithUnitField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { pixelAdapter } from '../shared/adapter';
import type { AttributeFormItemProps } from './types';

export function BorderWidth({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={t`高度`}
      name={`${focusIdx}.attributes.border-width`}
      config={pixelAdapter}
      suffix='px'
      type='number'
      autoComplete='off'
      formItem={formItem}
    />
  );
}
