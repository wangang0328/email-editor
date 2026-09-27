import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { MultiSelectStringField } from '@panels/form';
import { useFontFamilySelectOptions } from '@panels/hooks/useFontFamilySelectOptions';
import type { AttributeFormItemProps } from './types';

export function FontFamily({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();
  const { options } = useFontFamilySelectOptions();
  const fieldName = name || `${focusIdx}.attributes.font-family`;

  return (
    <MultiSelectStringField
      style={{ minWidth: 100, flex: 1 }}
      label={t`字体`}
      name={fieldName}
      options={options}
      formItem={formItem}
    />
  );
}
