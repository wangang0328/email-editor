import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Padding } from '@panels/panel-deps';
import { ContainerBackgroundColor } from '@panels/panel-deps';
import { BorderWidth } from '@panels/panel-deps';
import { BorderStyle } from '@panels/panel-deps';
import { BorderColor } from '@panels/panel-deps';
import { Width } from '@panels/panel-deps';
import { Align } from '@panels/panel-deps';

import { AttributesPanelWrapper } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';

export function DividerPanel() {
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item name='1' header={t`尺寸`}>
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <Width unitOptions='percent' />
              </Grid.Col>
              <Grid.Col offset={1} span={11} />
            </Grid.Row>

            <Align />
            <Padding />
          </Space>
        </Collapse.Item>

        <Collapse.Item name='2' header={t`边框`}>
          <Space direction='vertical' style={{ width: '100%' }}>
            <BorderWidth />
            <BorderStyle />
            <BorderColor />
          </Space>
        </Collapse.Item>

        <Collapse.Item name='3' header={t`背景`}>
          <Grid.Row>
            <Grid.Col span={11}>
              <ContainerBackgroundColor title={t`背景`} />
            </Grid.Col>
            <Grid.Col offset={1} span={11} />
          </Grid.Row>
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
