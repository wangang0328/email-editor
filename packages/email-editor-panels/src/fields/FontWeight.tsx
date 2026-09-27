import { t } from '@lingui/core/macro';
import { Form } from '@wa-dev/email-editor-ui';
import React, { useMemo } from 'react';
import { Field } from 'react-final-form';
import {
  getBlockNodeByIdx,
  useFocusBlockLayout,
  useFocusIdx,
} from '@wa-dev/email-editor-editor';
import { Select } from '@panels/form/Select';
import { useFormatActive } from '@panels/form/RichTextToolBar/hooks/useFormatActive';
import { hasValidUserSelection } from '@panels/form/RichTextToolBar/utils/selection';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import type { AttributeFormItemProps } from './types';

const options = [
  {
    value: 'normal',
    get label() {
      return t`正常`;
    },
  },
  {
    value: 'bold',
    get label() {
      return t`加粗`;
    },
  },
  {
    value: '100',
    label: '100',
  },
  {
    value: '200',
    label: '200',
  },
  {
    value: '300',
    label: '300',
  },
  {
    value: '400',
    label: '400',
  },
  {
    value: '500',
    label: '500',
  },
  {
    value: '600',
    label: '600',
  },
  {
    value: '700',
    label: '700',
  },
  {
    value: '800',
    label: '800',
  },
  {
    value: '900',
    label: '900',
  },
];

export function FontWeight({
  name,
  formItem,
}: AttributeFormItemProps & { name?: string }) {
  const { focusIdx } = useFocusIdx();
  const fieldName = name || `${focusIdx}.attributes.font-weight`;
  const { selectionRange } = useSelectionRange();
  const { focusBlockNode } = useFocusBlockLayout();
  const liveBlockNode = getBlockNodeByIdx(focusIdx) ?? focusBlockNode;
  const isInlineBold = useFormatActive('bold');
  const hasSelection = hasValidUserSelection(selectionRange, liveBlockNode);

  const layoutStyle = useMemo(
    () => ({
      labelCol: { span: 24, style: {} },
      wrapperCol: { span: 24 },
    }),
    [],
  );

  return (
    <Field name={fieldName}>
      {({ input, meta }) => {
        const displayValue =
          hasSelection && isInlineBold ? 'bold' : (input.value as string);

        return (
          <Form.Item
            style={{ margin: 0 }}
            labelAlign="top"
            label={formItem?.label ?? t`字重`}
            validateStatus={meta.touched && meta.error ? 'error' : undefined}
            help={meta.touched && meta.error ? meta.error : undefined}
            {...layoutStyle}
            {...formItem}
          >
            <Select
              options={options}
              value={displayValue}
              onChange={input.onChange}
            />
          </Form.Item>
        );
      }}
    </Field>
  );
}
