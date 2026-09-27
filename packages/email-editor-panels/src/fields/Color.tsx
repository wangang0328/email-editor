import { t } from '@lingui/core/macro';
import React from 'react';
import { ColorPickerField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import type { AttributeTitleFormItemProps } from './types';

type ColorProps = AttributeTitleFormItemProps & {
  inline?: boolean;
};

export function Color({
  title = t({ context: 'field.color', message: '颜色' }),
  formItem,
}: ColorProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.color`}
      formItem={formItem}
    />
  );
}
