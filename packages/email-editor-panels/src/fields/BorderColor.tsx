import { t } from '@lingui/core/macro';
import React from 'react';
import { ColorPickerField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import type { AttributeTitleFormItemProps } from './types';

export function BorderColor({
  title = t({ context: 'field.borderColor', message: '颜色' }),
  formItem,
}: AttributeTitleFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.border-color`}
      formItem={formItem}
    />
  );
}
