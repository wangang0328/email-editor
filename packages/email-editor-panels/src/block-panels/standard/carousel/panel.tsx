import { Collapse, Grid, Space } from '@panels/panel-deps';
import { Link } from 'lucide-react';
import { t } from '@lingui/core/macro';
import React from 'react';
import {
  ColorPickerField,
  EditTabField,
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  SelectField,
  TextField,
} from '@panels/panel-deps';
import { Stack, useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';
import { ICarousel } from '@wa-dev/email-editor-blocks-react';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { FieldLabel } from '@panels/shared/UI/FieldLabel';
import { imageFormatRequiredTip } from '@panels/utils/imageFormatTip';

const options = [
  {
    value: 'hidden',
    get label() {
      return t`隐藏`;
    },
  },
  {
    value: 'visible',
    get label() {
      return t`显示`;
    },
  },
];

export function CarouselPanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space direction='vertical'>
            <InputWithUnitField
              label={t`缩略图宽度`}
              name={`${focusIdx}.attributes.tb-width`}
              quickchange
              inline
            />

            <RadioGroupField
              label={t`缩略图`}
              name={`${focusIdx}.attributes.thumbnails`}
              options={options}
              inline
            />
            <Align inline />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='4'
          contentStyle={{ padding: 0 }}
          header={t({ context: 'panel.section.images', message: '图片' })}
        >
          <Stack
            vertical
            spacing='tight'
          >
            <EditTabField
              tabPosition='top'
              name={`${focusIdx}.data.value.images`}
              label=''
              labelHidden
              renderItem={(item, index) => (
                <CarouselImage
                  item={item}
                  index={index}
                />
              )}
              additionItem={{
                src: 'https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg',
                target: '_blank',
              }}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item
          name='3'
          header={t`图标`}
        >
          <Grid.Row>
            <Grid.Col span={11}>
              <TextField
                label={t`左侧图标`}
                name={`${focusIdx}.attributes.left-icon`}
              />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <TextField
                label={t`右侧图标`}
                name={`${focusIdx}.attributes.right-icon`}
              />
            </Grid.Col>
          </Grid.Row>

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
            />
          </Grid.Row>
        </Collapse.Item>

        <Collapse.Item
          name='1'
          header={t`边框`}
        >
          <Grid.Row>
            <Grid.Col span={11}>
              <ColorPickerField
                label={t`悬停边框`}
                name={`${focusIdx}.attributes.tb-hover-border-color`}
              />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <ColorPickerField
                label={t`选中边框`}
                name={`${focusIdx}.attributes.tb-selected-border-color`}
              />
            </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col span={11}>
              <TextField
                label={t`缩略图边框`}
                name={`${focusIdx}.attributes.tb-border`}
              />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <TextField
                label={t`缩略图圆角`}
                name={`${focusIdx}.attributes.tb-border-radius`}
              />
            </Grid.Col>
          </Grid.Row>
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

function CarouselImage({
  item,
  index,
}: {
  item: ICarousel['data']['value']['images'];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();
  return (
    <Space direction='vertical'>
      <ImageUploaderField
        label={(
          <FieldLabel
            label={t({ context: 'field.image', message: '图片' })}
            tip={imageFormatRequiredTip()}
          />
        )}
        name={`${focusIdx}.data.value.images.[${index}].src`}
        uploadHandler={onUploadImage}
      />
      <Grid.Row>
        <Grid.Col span={11}>
          <TextField
            prefix={<Link className="h-4 w-4" />}
            label={t`链接地址`}
            name={`${focusIdx}.data.value.images.[${index}].href`}
          />
        </Grid.Col>
        <Grid.Col
          offset={1}
          span={11}
        >
          <SelectField
            label={t`打开方式`}
            name={`${focusIdx}.data.value.images.[${index}].target`}
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
          />
        </Grid.Col>
      </Grid.Row>

      <TextField
        label={t`标题`}
        name={`${focusIdx}.data.value.image.[${index}].title`}
      />
    </Space>
  );
}
