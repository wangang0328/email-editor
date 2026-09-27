import {
  Collapse,
  Grid,
  Space,
  Tooltip,
  Button,
} from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React, { useState } from 'react';
import { Padding } from '@panels/panel-deps';
import { TextDecoration } from '@panels/panel-deps';
import { FontWeight } from '@panels/panel-deps';
import { FontStyle } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { Height } from '@panels/panel-deps';
import { ContainerBackgroundColor } from '@panels/panel-deps';
import { FontSize } from '@panels/panel-deps';
import { Color } from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';
import { LineHeight } from '@panels/panel-deps';
import { LetterSpacing } from '@panels/panel-deps';

import { AttributesPanelWrapper } from '@panels/panel-deps';
import { Code } from 'lucide-react';
import { HtmlEditor } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { pairedFormItem, panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';
import type { FormItemProps } from '@panels/panel-deps';

export type TextPanelProps = {
  /** 透传到排版/颜色等表单项，默认带双列对齐样式 */
  formItem?: FormItemProps;
};

export function TextPanel({ formItem: formItemFromProps }: TextPanelProps = {}) {
  const [visible, setVisible] = useState(false);

  const fieldFormItem = {
    ...pairedFormItem,
    ...formItemFromProps,
  };

  return (
    <AttributesPanelWrapper
      extra={(
        <Tooltip content={t`HTML 模式`}>
          <Button
            onClick={() => setVisible(true)}
            icon={<Code size={16} />}
            className="inline-flex h-8 w-8 items-center justify-center"
          />
        </Tooltip>
      )}
    >
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Height
              numberWithPx
              formItem={fieldFormItem}
              stack={{ className: 'w-full' }}
            />
            <Padding showResetAll formItem={fieldFormItem} />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={t`颜色`}
        >
          <Grid.Row>
            <Grid.Col span={11}>
              <Color formItem={fieldFormItem} />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <ContainerBackgroundColor formItem={fieldFormItem} title={t`背景颜色`} />
            </Grid.Col>
          </Grid.Row>
        </Collapse.Item>
        <Collapse.Item
          name='2'
          header={t`排版`}
        >
          <Space {...panelVerticalSpaceProps}>
            <FontFamily formItem={fieldFormItem} />

            <Grid.Row>
              <Grid.Col span={11}>
                <FontSize formItem={fieldFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LineHeight formItem={fieldFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <LetterSpacing formItem={fieldFormItem} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <TextDecoration formItem={fieldFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <FontWeight formItem={fieldFormItem} />
              </Grid.Col>
            </Grid.Row>

            <Align formItem={fieldFormItem} />
            <FontStyle formItem={fieldFormItem} />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='4'
          header={t`额外属性`}
        >
          <Grid.Col span={24}>
            <ClassName formItem={fieldFormItem} />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
      <HtmlEditor
        visible={visible}
        setVisible={setVisible}
      />
    </AttributesPanelWrapper>
  );
}
