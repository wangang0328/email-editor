import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Padding } from '@panels/panel-deps';
import { Background } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { Border } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';

export function WrapperPanel() {
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header={t`尺寸`}>
          <Space {...panelVerticalSpaceProps}>
            <Padding />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='1' header={t`背景`}>
          <Space {...panelVerticalSpaceProps}>
            <Background />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='2' header={t`边框`}>
          <Border />
        </Collapse.Item>
        <Collapse.Item name='4' header={t`额外属性`}>
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
