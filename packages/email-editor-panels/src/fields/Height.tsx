import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';
import { InputWithUnitField, TextField } from '@panels/form';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { UseFieldConfig } from 'react-final-form';
import type { FormItemProps } from '@wa-dev/email-editor-ui';
import { pixelAdapter } from '../shared/adapter';

export function Height({
  inline,
  config,
  formItem,
  stack,
  numberWithPx,
}: {
  inline?: boolean;
  config?: UseFieldConfig<any>;
  formItem?: FormItemProps;
  /** 数字输入 + px 后缀 */
  numberWithPx?: boolean;
  /** @deprecated 仅保留 className，用于外层宽度（如 `w-full`） */
  stack?: { className?: string };
  /** @deprecated 不再使用 */
  stackItem?: { className?: string; fill?: boolean };
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    const field = numberWithPx ? (
      <InputWithUnitField
        label={t`高度`}
        name={`${focusIdx}.attributes.height`}
        config={config ?? pixelAdapter}
        suffix='px'
        type='number'
        autoComplete='off'
        formItem={formItem}
      />
    ) : (
      <TextField
        label={t`高度`}
        name={`${focusIdx}.attributes.height`}
        quickchange
        inline={inline}
        config={config}
        formItem={formItem}
      />
    );

    if (stack?.className) {
      return <div className={stack.className}>{field}</div>;
    }

    return field;
  }, [config, focusIdx, formItem, inline, numberWithPx, stack?.className]);
}
