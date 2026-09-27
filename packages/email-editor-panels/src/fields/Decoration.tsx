import { t } from '@lingui/core/macro';
import React from 'react';
import { NumberField, TextField } from '@panels/form';
import { useFocusIdx, Stack, TextStyle } from '@wa-dev/email-editor-editor';
import type { AttributeFormItemProps } from './types';

export function Decoration({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack
      key={focusIdx}
      vertical
      spacing='extraTight'
    >
      <TextStyle
        variation='strong'
        size='large'
      >
        Decoration
      </TextStyle>
      <TextField
        label={t`圆角`}
        name={`${focusIdx}.attributes.borderRadius`}
        inline
        formItem={formItem}
      />
      <TextField
        label={t`边框`}
        name={`${focusIdx}.attributes.border`}
        inline
        formItem={formItem}
      />
      <NumberField
        label={t`不透明度`}
        max={1}
        min={0}
        step={0.1}
        name={`${focusIdx}.attributes.opacity`}
        inline
        formItem={formItem}
      />
    </Stack>
  );
}
