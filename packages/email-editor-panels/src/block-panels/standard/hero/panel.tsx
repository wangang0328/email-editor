import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { BackgroundColor } from '@panels/panel-deps';
import { ImageUploaderField, InputWithUnitField, RadioGroupField, TextField } from '@panels/panel-deps';
import { Width } from '@panels/panel-deps';
import { Height } from '@panels/panel-deps';
import { VerticalAlign } from '@panels/panel-deps';
import { Padding } from '@panels/panel-deps';
import { useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { imageFormatRequiredTip } from '@panels/utils/imageFormatTip';

const options = [
  {
    value: 'fluid-height',
    get label() {
      return t`自适应高度`;
    },
  },
  {
    value: 'fixed-height',
    get label() {
      return t`固定高度`;
    },
  },
];

export function HeroPanel() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space direction='vertical'>
            <RadioGroupField
              label={t`模式`}
              name={`${focusIdx}.attributes.mode`}
              options={options}
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <Width />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <Height />
              </Grid.Col>
            </Grid.Row>

            <Padding />
            <VerticalAlign />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={t`背景`}
        >
          <Space direction='vertical'>
            <ImageUploaderField
              label={t`图片地址`}
              name={`${focusIdx}.attributes.background-url`}
              helpText={imageFormatRequiredTip()}
              uploadHandler={onUploadImage}
            />

            <Grid.Row>
              <Grid.Col span={11}>
                <InputWithUnitField
                  label={t`背景宽度`}
                  name={`${focusIdx}.attributes.background-width`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <InputWithUnitField
                  label={t`背景高度`}
                  name={`${focusIdx}.attributes.background-height`}
                />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label={t`背景位置`}
                  name={`${focusIdx}.attributes.background-position`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <InputWithUnitField
                  label={t`圆角`}
                  name={`${focusIdx}.attributes.border-radius`}
                  unitOptions='percent'
                />
              </Grid.Col>
              <Grid.Col span={11}>
                <BackgroundColor />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='4'
          header={t`额外属性`}
        >
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
