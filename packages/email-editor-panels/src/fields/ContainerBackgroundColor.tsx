import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';
import { ColorPickerField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import type { FormItemProps } from '@wa-dev/email-editor-ui';
import type { AttributeTitleFormItemProps } from './types';

export function ContainerBackgroundColor({
  title = t`容器背景颜色`,
  formItem,
}: AttributeTitleFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const mergedFormItem = useMemo(
    () =>
      ({
        labelAlign: 'top',
        ...formItem,
      }) as FormItemProps,
    [formItem],
  );

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.container-background-color`}
      formItem={mergedFormItem}
    />
  );
}
