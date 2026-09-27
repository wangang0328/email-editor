import { Grid, Space } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import React from 'react';
import { ImageUploaderField, SelectField, TextField } from '@panels/form';
import { useFocusIdx, useEditorProps } from '@wa-dev/email-editor-editor';
import { BackgroundColor } from './BackgroundColor';
import type { AttributeFormItemProps } from './types';
import { FieldLabel } from '@panels/shared/UI/FieldLabel';

const backgroundRepeatOptions = [
  {
    value: 'no-repeat',
    get label() {
      return t`不重复`;
    },
  },
  {
    value: 'repeat',
    get label() {
      return t`重复`;
    },
  },
  {
    value: 'repeat-x',
    get label() {
      return t`水平重复`;
    },
  },
  {
    value: 'repeat-y',
    get label() {
      return t`垂直重复`;
    },
  },
];

export function Background({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <Space
      key={focusIdx}
      direction='vertical'
    >
      <ImageUploaderField
        label={(
          <FieldLabel
            label={t`背景图片`}
            tip={t`图片后缀应为 .jpg、jpeg、png、gif 等，否则图片可能无法正常显示。`}
          />
        )}
        name={`${focusIdx}.attributes.background-url`}
        uploadHandler={onUploadImage}
        formItem={{ labelAlign: 'top', ...formItem }}
      />

      <Grid.Row>
        <Grid.Col span={11}>
          <BackgroundColor formItem={{ labelAlign: 'top', ...formItem }} />
        </Grid.Col>
        <Grid.Col
          offset={1}
          span={11}
        >
          <SelectField
            label={t`背景重复`}
            name={`${focusIdx}.attributes.background-repeat`}
            options={backgroundRepeatOptions}
            formItem={{ labelAlign: 'top', ...formItem }}
          />
        </Grid.Col>
      </Grid.Row>
      <TextField
        label={t`背景尺寸`}
        name={`${focusIdx}.attributes.background-size`}
        formItem={{ labelAlign: 'top', ...formItem }}
      />
    </Space>
  );
}
