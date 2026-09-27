import {
  Align,
  AttributesPanelWrapper,
  BackgroundColor,
  Border,
  ClassName,
  CollapseWrapper,
  Color,
  ContainerBackgroundColor,
  FontFamily,
  FontSize,
  FontStyle,
  FontWeight,
  LetterSpacing,
  LineHeight,
  Link,
  MergeTags,
  Padding,
  TextDecoration,
  Width,
  Collapse,
  Grid,
  Popover,
  Space,
  Button as UiButton,
  TextField,
} from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import { useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { Braces } from 'lucide-react';
import React from 'react';
import { useField } from 'react-final-form';
import { pairedFormItem, panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';

/** Button block attribute panel (co-located with `./schema` `IButton`). */
export function ButtonPanel() {
  const { focusIdx } = useFocusIdx();
  const { input } = useField(`${focusIdx}.data.value.content`, {
    parse: v => v,
  });

  const { mergeTags } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item
          name='-1'
          header={t`设置`}
        >
          <Space {...panelVerticalSpaceProps}>
            <TextField
              label={(
                <Space>
                  <span>{t({ context: 'field.content', message: '内容' })}</span>
                  {mergeTags && (
                    <Popover
                      trigger='click'
                      content={(
                        <MergeTags
                          value={input.value}
                          onChange={input.onChange}
                        />
                      )}
                    >
                      <UiButton
                        type='text'
                        icon={<Braces size={16} />}
                      />
                    </Popover>
                  )}
                </Space>
              )}
              name={`${focusIdx}.data.value.content`}
            />
            <Link />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row>
              <Grid.Col span={11}>
                <Width formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontWeight formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Padding
              title={t`外边距`}
              attributeName='padding'
              showResetAll
            />
            <Padding
              title={t`内边距`}
              attributeName='inner-padding'
            />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='1'
          header={t`颜色`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row>
              <Grid.Col span={11}>
                <Color title={t`文字颜色`} formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <BackgroundColor title={t`按钮颜色`} formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>
            <ContainerBackgroundColor title={t`背景颜色`} formItem={pairedFormItem} />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`排版`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontSize formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <FontWeight formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LineHeight formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextDecoration formItem={pairedFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LetterSpacing formItem={pairedFormItem} />
              </Grid.Col>
            </Grid.Row>
            <Align />
            <FontStyle />
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
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
