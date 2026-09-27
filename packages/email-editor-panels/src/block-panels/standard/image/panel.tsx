import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Padding } from '@panels/panel-deps';
import {
  ColorPickerField,
  ImageUploaderField,
  SwitchField,
  TextField,
} from '@panels/panel-deps';
import { Width } from '@panels/panel-deps';
import { Height } from '@panels/panel-deps';
import { Link } from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';

import { AttributesPanelWrapper } from '@panels/panel-deps';
import { Border } from '@panels/panel-deps';
import { useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { CollapseWrapper } from '@panels/panel-deps';
import { imageHeightAdapter, pixelAdapter } from '@panels/panel-deps';
import { pairedFormItem, panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';
import { FieldLabel } from '@panels/shared/UI/FieldLabel';
import { imageFormatRequiredTip } from '@panels/utils/imageFormatTip';

const fullWidthOnMobileAdapter = {
  format(obj: any) {
    return Boolean(obj);
  },
  parse(val: string) {
    if (!val) return undefined;

    return 'true';
  },
};

export function ImagePanel() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item
          name='1'
          header={t`设置`}
        >
          <Space {...panelVerticalSpaceProps}>
            <ImageUploaderField
              label={(
                <FieldLabel
                  label={t({ context: 'field.image', message: '图片' })}
                  tip={imageFormatRequiredTip()}
                />
              )}
              name={`${focusIdx}.attributes.src`}
              uploadHandler={onUploadImage}
            />
            <Grid.Row align='stretch'>
              <Grid.Col span={11}>
                <ColorPickerField
                  label={t`背景颜色`}
                  name={`${focusIdx}.attributes.container-background-color`}
                  formItem={pairedFormItem}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <SwitchField
                  label={t`移动端全宽显示`}
                  name={`${focusIdx}.attributes.fluid-on-mobile`}
                  config={fullWidthOnMobileAdapter}
                  textInside
                  formItem={pairedFormItem}
                />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row>
              <Grid.Col span={11}>
                <Width config={pixelAdapter} formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <Height config={imageHeightAdapter} formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Padding showResetAll />
            <Align />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`链接`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Link />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='3'
          header={t`边框`}
        >
          <Border />
        </Collapse.Item>

        <Collapse.Item
          name='4'
          header={t`额外属性`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label={t`标题`}
                  name={`${focusIdx}.attributes.title`}
                  formItem={pairedFormItem}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <TextField
                  label={t`替代文本`}
                  name={`${focusIdx}.attributes.alt`}
                  formItem={pairedFormItem}
                />
              </Grid.Col>
            </Grid.Row>
            <TextField
              label={t`class name`}
              name={`${focusIdx}.attributes.css-class`}
            />
          </Space>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
