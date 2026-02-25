import React, { useMemo } from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';

export function BackgroundColor({ title = t('Background color') }: { title?: string }) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.background-color`}
      />
    );
  }, [focusIdx, title]);
}
