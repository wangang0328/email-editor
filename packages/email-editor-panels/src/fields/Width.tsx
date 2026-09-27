import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { InputWithUnitField } from '@panels/form';
import { useFocusIdx, useBlock } from '@wa-dev/email-editor-editor';
import { BasicType, getParentByIdx } from '@wa-dev/email-editor-blocks-react';
import { InputWithUnitProps } from '@panels/form/InputWithUnit';
import { UseFieldConfig } from 'react-final-form';
import type { AttributeFormItemProps } from './types';

export function Width({
  inline = false,
  unitOptions,
  config,
  formItem,
}: AttributeFormItemProps & {
  inline?: boolean;
  unitOptions?: InputWithUnitProps['unitOptions'];
  config?: UseFieldConfig<any>;
}) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, values } = useBlock();
  const parentType = getParentByIdx({ content: values.content }, focusIdx)?.type;

  const validate = useMemoizedFn((val: string): string | undefined => {
    if (focusBlock?.type === BasicType.COLUMN && parentType === BasicType.GROUP) {
      return /(\d)*%/.test(val)
        ? undefined
        : t`分组内的列宽度必须使用百分比，而非像素`;
    }
    return undefined;
  });

  return (
    <InputWithUnitField
      validate={validate}
      label={t`宽度`}
      inline={inline}
      name={`${focusIdx}.attributes.width`}
      unitOptions={unitOptions}
      config={config}
      formItem={formItem}
    />
  );
}
