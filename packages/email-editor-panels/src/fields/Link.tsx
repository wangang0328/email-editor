import { Grid, Popover, Button as ArcoButton } from '@wa-dev/email-editor-ui';
import { Link as LinkIcon } from 'lucide-react';
import { t } from '@lingui/core/macro';
import React from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { Braces } from 'lucide-react';
import { SelectField, TextField } from '@panels/form';
import { MergeTags } from './MergeTags';
import { useField } from 'react-final-form';
import type { AttributeFormItemProps } from './types';

/** 与 Form.Item label-top 的 leading-[22px] 对齐，避免并排字段标题错落 */
const fieldLabelRowClass =
  'inline-flex h-[22px] items-center gap-1 leading-[22px]';

export function Link({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const { input } = useField(`${focusIdx}.attributes.href`, {
    parse: v => v,
  });

  return (
    <Grid.Row>
      <Grid.Col span={11}>
        <TextField
          prefix={<LinkIcon className="h-4 w-4" />}
          label={
            <span className={fieldLabelRowClass}>
              <span>{t`链接地址`}</span>
              <Popover
                trigger='click'
                content={
                  <MergeTags
                    value={input.value}
                    onChange={input.onChange}
                  />
                }
              >
                <ArcoButton
                  type='text'
                  size='mini'
                  icon={<Braces size={16} />}
                  className='!m-0 !h-[22px] !w-[22px] !min-h-0 shrink-0 !p-0'
                />
              </Popover>
            </span>
          }
          name={`${focusIdx}.attributes.href`}
          formItem={formItem}
        />
      </Grid.Col>
      <Grid.Col
        offset={1}
        span={11}
      >
        <SelectField
          label={<span className={fieldLabelRowClass}>{t`打开方式`}</span>}
          name={`${focusIdx}.attributes.target`}
          options={[
            {
              value: '',
              label: t`当前窗口打开`,
            },
            {
              value: '_blank',
              label: t`新窗口打开`,
            },
          ]}
          formItem={formItem}
        />
      </Grid.Col>
    </Grid.Row>
  );
}
