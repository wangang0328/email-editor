import { t } from '@lingui/core/macro';
import React from 'react';
import { InputWithUnitField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { pixelAdapter } from '../shared/adapter';
import { FieldLabel } from '@panels/shared/UI/FieldLabel';
import type { AttributeFormItemProps } from './types';

export function LetterSpacing({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={(
        <FieldLabel
          label={t`字间距`}
          tip={t`控制字符之间的间距，建议 1–5px；中文效果较不明显，可适当加大数值。`}
        />
      )}
      name={name || `${focusIdx}.attributes.letter-spacing`}
      config={pixelAdapter}
      suffix='px'
      type='number'
      autoComplete='off'
      formItem={formItem}
    />
  );
}
