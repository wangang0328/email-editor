import { Collapse, Grid, Space } from '@panels/panel-deps';
import { Link } from 'lucide-react';
import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';
import { Padding } from '@panels/panel-deps';
import {
  EditGridTabField,
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  TextField,
} from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';
import { Color } from '@panels/panel-deps';
import { ContainerBackgroundColor } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { FontSize } from '@panels/panel-deps';
import { FontStyle } from '@panels/panel-deps';
import { FontWeight } from '@panels/panel-deps';

import { AttributesPanelWrapper } from '@panels/panel-deps';
import { TextDecoration } from '@panels/panel-deps';
import { LineHeight } from '@panels/panel-deps';
import { useBlock, useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { ISocial } from '@wa-dev/email-editor-blocks-react';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { FieldLabel } from '@panels/shared/UI/FieldLabel';
import { imageFormatRequiredTip } from '@panels/utils/imageFormatTip';

const options = [
  {
    value: 'vertical',
    get label() {
      return t`垂直`;
    },
  },
  {
    value: 'horizontal',
    get label() {
      return t`水平`;
    },
  },
];

export function SocialPanel() {
  const { focusIdx } = useFocusIdx();
  const { focusBlock } = useBlock();
  const value = focusBlock?.data.value as ISocial['data']['value'];
  if (!value) return null;

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3']}>
        <Collapse.Item
          name='1'
          header={t`设置`}
        >
          <Space direction='vertical'>
            <RadioGroupField
              label={t`模式`}
              name={`${focusIdx}.attributes.mode`}
              options={options}
            />

            <Align />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='3'
          header={t`排版`}
        >
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontSize />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <FontWeight />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LineHeight />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <Color />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <ContainerBackgroundColor title={t`背景颜色`} />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <TextDecoration />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontStyle />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`社交媒体项`}
          contentStyle={{ padding: 10 }}
        >
          <EditGridTabField
            tabPosition='top'
            name={`${focusIdx}.data.value.elements`}
            label=''
            labelHidden
            renderItem={(item, index) => (
              <SocialElement
                item={item}
                index={index}
              />
            )}
          />
        </Collapse.Item>

        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space
            direction='vertical'
            size='large'
          >
            <Grid.Row>
              <Grid.Col span={11}>
                <InputWithUnitField
                  label={t`图标宽度`}
                  name={`${focusIdx}.attributes.icon-size`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <TextField
                  label={t`圆角`}
                  name={`${focusIdx}.attributes.border-radius`}
                />
              </Grid.Col>
            </Grid.Row>

            <Padding />
            <Padding
              attributeName='inner-padding'
              title={t`图标内边距`}
            />
            <Padding
              attributeName='text-padding'
              title={t`文字内边距`}
            />
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

function SocialElement({
  index,
}: {
  item: ISocial['data']['value']['elements'][0];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, socialIcons } = useEditorProps();

  const autoCompleteOptions = useMemo(() => {
    if (!socialIcons) return undefined;
    return socialIcons.map(icon => {
      return {
        label: icon.content,
        value: icon.image,
      };
    });
  }, [socialIcons]);

  return (
    <Space direction='vertical'>
      <ImageUploaderField
        label={(
          <FieldLabel
            label={t({ context: 'field.image', message: '图片' })}
            tip={imageFormatRequiredTip()}
          />
        )}
        labelHidden
        autoCompleteOptions={autoCompleteOptions}
        name={`${focusIdx}.data.value.elements.[${index}].src`}
        uploadHandler={onUploadImage}
      />

      <Grid.Row>
        <Grid.Col span={11}>
          <TextField
            label={t({ context: 'field.content', message: '内容' })}
            name={`${focusIdx}.data.value.elements.[${index}].content`}
            quickchange
          />
        </Grid.Col>
        <Grid.Col
          offset={1}
          span={11}
        >
          <TextField
            prefix={<Link className="h-4 w-4" />}
            label={t`链接`}
            name={`${focusIdx}.data.value.elements.[${index}].href`}
          />
        </Grid.Col>
      </Grid.Row>
      {/* <Grid.Row>
        <Grid.Col span={11}>
          <InputWithUnitField
            label={t`图标宽度`}
            name={`${focusIdx}.data.value.elements.[${index}].icon-size`}
          />
        </Grid.Col>
        <Grid.Col offset={1} span={11}>
          <InputWithUnitField
            label={t`图标高度`}
            name={`${focusIdx}.data.value.elements.[${index}].icon-height`}
          />
        </Grid.Col>
      </Grid.Row> */}
    </Space>
  );
}
