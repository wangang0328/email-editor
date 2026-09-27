import { colorAdapter } from '@panels/shared/adapter';
import React, { ComponentProps } from 'react';
import { ColorPicker, ColorPickerProps } from '../ColorPicker';
import enhancer from '../enhancer';
import type { FormItemProps } from '@wa-dev/email-editor-ui';

const ColorPickerFieldSource = enhancer<ColorPickerProps>(ColorPicker, e => e, {
  debounceTime: 1,
});

export const ColorPickerField = (
  props: ComponentProps<typeof ColorPickerFieldSource>,
) => {
  return (
    <ColorPickerFieldSource
      config={colorAdapter}
      {...props}
    />
  );
};
