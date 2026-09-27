import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import {
  ColorPickerField,
  InputWithUnitField,
  TextAreaField,
  TextField,
} from '@panels/panel-deps';
import { AddFont } from '@panels/panel-deps';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { FontFamily, LineHeight } from '@panels/panel-deps';
import { pixelAdapter } from '@panels/panel-deps';
import { pairedFormItem, panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';

interface PageProps { hideSubTitle?: boolean; hideSubject?: boolean}
export function PagePanel({ hideSubTitle, hideSubject }: PageProps) {
  const { focusIdx } = useFocusIdx();

  if (!focusIdx) return null;

  return (
    <AttributesPanelWrapper>
      <div className="px-4 pb-6 pt-1">
        <Collapse bordered={false} defaultActiveKey={['0', '1']}>
          <Collapse.Item
            name='0'
            header={t`邮件设置`}
          >
            <Space {...panelVerticalSpaceProps}>
              {!hideSubject && (
                <TextField
                  label={t`主题`}
                  name={'subject'}
                  formItem={{ labelAlign: 'top' }}
                />
              )}
              {!hideSubTitle && (
                <TextField
                  label={t`副标题`}
                  name={'subTitle'}
                  formItem={{ labelAlign: 'top' }}
                />
              )}
              <InputWithUnitField
                label={t`宽度`}
                name={`${focusIdx}.attributes.width`}
                config={pixelAdapter}
                suffix='px'
                type='number'
                autoComplete='off'
                formItem={{ labelAlign: 'top' }}
              />
              <InputWithUnitField
                label={t`断点`}
                helpText={t`用于控制布局在何种断点下切换桌面/移动端视图。`}
                name={`${focusIdx}.data.value.breakpoint`}
                config={pixelAdapter}
                suffix='px'
                type='number'
                autoComplete='off'
                formItem={{ labelAlign: 'top' }}
              />
            </Space>
          </Collapse.Item>
          <Collapse.Item
            name='1'
            header={t`主题设置`}
          >
            <Space {...panelVerticalSpaceProps}>
              <FontFamily
                name={`${focusIdx}.data.value.font-family`}
                formItem={pairedFormItem}
              />

              <InputWithUnitField
                label={t`字号`}
                name={`${focusIdx}.data.value.font-size`}
                config={pixelAdapter}
                suffix='px'
                type='number'
                autoComplete='off'
                formItem={pairedFormItem}
              />

              <Grid.Row>
                <Grid.Col span={11}>
                  <LineHeight
                    name={`${focusIdx}.data.value.line-height`}
                    formItem={pairedFormItem}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <InputWithUnitField
                    label={t`字重`}
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.font-weight`}
                    formItem={pairedFormItem}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <ColorPickerField
                    label={t`文字颜色`}
                    name={`${focusIdx}.data.value.text-color`}
                    formItem={pairedFormItem}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <ColorPickerField
                    label={t`背景`}
                    name={`${focusIdx}.attributes.background-color`}
                    formItem={pairedFormItem}
                  />
                </Grid.Col>
              </Grid.Row>

              <ColorPickerField
                label={t`内容背景`}
                name={`${focusIdx}.data.value.content-background-color`}
                formItem={pairedFormItem}
              />

              <TextAreaField
                autoSize
                label={t`自定义样式`}
                name={`${focusIdx}.data.value.user-style.content`}
              />
              <AddFont />
            </Space>
          </Collapse.Item>
        </Collapse>
      </div>
    </AttributesPanelWrapper>
  );
}
