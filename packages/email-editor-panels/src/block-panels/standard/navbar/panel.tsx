import { Collapse, Grid, Space } from '@panels/panel-deps';
import { Link } from 'lucide-react';
import { t } from '@lingui/core/macro';
import React from 'react';
import { ColorPickerField, EditTabField, SelectField, TextField } from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { NavbarLinkPadding } from '@panels/panel-deps';
import { useFocusIdx, Stack } from '@wa-dev/email-editor-editor';
import { INavbar } from '@wa-dev/email-editor-blocks-react';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import {
  FontFamily,
  FontStyle,
  FontWeight,
  LetterSpacing,
  LineHeight,
  TextDecoration,
  TextTransform,
} from '@panels/panel-deps';
import { pixelAdapter } from '@panels/panel-deps';

export function NavbarPanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={t`布局`}
        >
          <Stack
            vertical
            spacing='tight'
          >
            <Align />
          </Stack>
        </Collapse.Item>

        <Collapse.Item
          contentStyle={{ padding: 0 }}
          name='1'
          header={t`导航链接`}
        >
          <Space
            direction='vertical'
            style={{ width: '100%' }}
          >
            <EditTabField
              tabPosition='top'
              name={`${focusIdx}.data.value.links`}
              label={t`链接`}
              labelHidden
              renderItem={(item, index) => (
                <NavbarLink
                  item={item}
                  index={index}
                />
              )}
              additionItem={{
                src: 'https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg',
                target: '_blank',
                content: t`新链接`,
                color: '#1890ff',
                'font-size': '13px',
              }}
            />
            <div />
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

function NavbarLink({
  item,
  index,
}: {
  item: INavbar['data']['value']['links'];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  return (
    <div className='NavbarLink'>
      <Space
        direction='vertical'
        style={{ width: '100%' }}
      >
        <Grid.Row>
          <Grid.Col span={11}>
            <TextField
              label={t({ context: 'field.content', message: '内容' })}
              name={`${focusIdx}.data.value.links.[${index}].content`}
            />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <ColorPickerField
              label={t`颜色`}
              name={`${focusIdx}.data.value.links.[${index}].color`}
            />
          </Grid.Col>
        </Grid.Row>

        <Grid.Row>
          <Grid.Col span={11}>
            <FontFamily name={`${focusIdx}.data.value.links.[${index}].font-family`} />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <TextField
              label={t`字号（像素）`}
              name={`${focusIdx}.data.value.links.[${index}].font-size`}
              config={pixelAdapter}
              autoComplete='off'
            />
          </Grid.Col>
        </Grid.Row>

        <Grid.Row>
          <Grid.Col span={11}>
            <LineHeight name={`${focusIdx}.data.value.links.[${index}].line-height`} />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <LetterSpacing
              name={`${focusIdx}.data.value.links.[${index}].letter-spacing`}
            />
          </Grid.Col>
        </Grid.Row>

        <Grid.Row>
          <Grid.Col span={11}>
            <TextDecoration
              name={`${focusIdx}.data.value.links.[${index}].text-decoration`}
            />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <FontWeight name={`${focusIdx}.data.value.links.[${index}].font-weight`} />
          </Grid.Col>
        </Grid.Row>

        <Grid.Row>
          <Grid.Col span={11}>
            <TextTransform
              name={`${focusIdx}.data.value.links.[${index}].text-transform`}
            />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          />
        </Grid.Row>
        <FontStyle name={`${focusIdx}.data.value.links.[${index}].font-style`} />
        <Grid.Row>
          <Grid.Col span={11}>
            <TextField
              prefix={<Link className="h-4 w-4" />}
              label={<span>{t`链接地址`}</span>}
              name={`${focusIdx}.data.value.links.[${index}].href`}
            />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <SelectField
              style={{ minWidth: 65 }}
              label={t`打开方式`}
              name={`${focusIdx}.data.value.links.[${index}].target`}
              options={[
                {
                  value: '_blank',
                  label: t`新窗口打开`,
                },
                {
                  value: '_self',
                  label: t`当前窗口打开`,
                },
              ]}
            />
          </Grid.Col>
        </Grid.Row>
        <NavbarLinkPadding
          key={index}
          name={`${focusIdx}.data.value.links.[${index}].padding`}
        />
        <div />
      </Space>
    </div>
  );
}
