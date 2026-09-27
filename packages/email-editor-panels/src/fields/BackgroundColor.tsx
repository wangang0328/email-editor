import { t } from '@lingui/core/macro';
import React from 'react';
import { ColorPickerField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import type { AttributeTitleFormItemProps } from './types';

export function BackgroundColor({
  title = t`背景颜色`,
  formItem,
}: AttributeTitleFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.background-color`}
      formItem={formItem}
    />
  );
}
