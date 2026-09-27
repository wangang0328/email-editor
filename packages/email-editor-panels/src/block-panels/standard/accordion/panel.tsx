import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { BackgroundColor } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { Padding } from '@panels/panel-deps';
import {
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  SelectField,
  TextField,
} from '@panels/panel-deps';
import { Border, ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';

const positionOptions = [
  {
    value: 'left',
    get label() {
      return t`左侧`;
    },
  },
  {
    value: 'right',
    get label() {
      return t`右侧`;
    },
  },
];

const alignOptions = [
  {
    value: 'top',
    get label() {
      return t`顶部`;
    },
  },
  {
    value: 'middle',
    get label() {
      return t`居中`;
    },
  },
  {
    value: 'bottom',
    get label() {
      return t`底部`;
    },
  },
];

export function AccordionPanel() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={t`设置`}
        >
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <BackgroundColor />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontFamily />
              </Grid.Col>
            </Grid.Row>

            <Padding />

            <Grid.Row>
              <Grid.Col span={11}>
                <InputWithUnitField
                  label={t`图标宽度`}
                  name={`${focusIdx}.attributes.icon-width`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <InputWithUnitField
                  label={t`图标高度`}
                  name={`${focusIdx}.attributes.icon-height`}
                />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <ImageUploaderField
                  label={t`展开图标`}
                  name={`${focusIdx}.attributes.icon-unwrapped-url`}
                  // helpText={imageFormatRequiredTip()}
                  uploadHandler={onUploadImage}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <ImageUploaderField
                  label={t`折叠图标`}
                  name={`${focusIdx}.attributes.icon-wrapped-url`}
                  uploadHandler={onUploadImage}
                />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <RadioGroupField
                  label={t`图标位置`}
                  name={`${focusIdx}.attributes.icon-position`}
                  options={positionOptions}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <SelectField
                  style={{ width: 120 }}
                  label={t`图标对齐`}
                  name={`${focusIdx}.attributes.icon-align`}
                  options={alignOptions}
                />
              </Grid.Col>
            </Grid.Row>

            <Border />
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
