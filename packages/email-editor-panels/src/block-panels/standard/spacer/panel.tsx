import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Height } from '@panels/panel-deps';
import { ContainerBackgroundColor } from '@panels/panel-deps';
import { Padding } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';

export function SpacerPanel() {
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item name='1' header={t`尺寸`}>
          <Space direction='vertical'>
            <Height numberWithPx stack={{ className: 'w-full' }} />
            <Padding />
          </Space>
        </Collapse.Item>

        <Collapse.Item name='2' header={t`背景`}>
          <ContainerBackgroundColor title={t`背景颜色`} />
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
