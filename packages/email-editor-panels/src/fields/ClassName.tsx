import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { TextField } from '@panels/form';
import type { AttributeFormItemProps } from './types';

export function ClassName({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <TextField
      label={t`样式类名`}
      name={`${focusIdx}.attributes.css-class`}
      formItem={formItem}
    />
  );
}
