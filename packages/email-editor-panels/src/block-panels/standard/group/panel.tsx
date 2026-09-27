import { Collapse, Grid } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Width } from '@panels/panel-deps';
import { BackgroundColor } from '@panels/panel-deps';
import { VerticalAlign } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';

export function GroupPanel() {
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header={t`尺寸`}>
          <Grid.Row>
            <Grid.Col span={11}>
              <Width />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <VerticalAlign />
            </Grid.Col>
          </Grid.Row>
        </Collapse.Item>
        <Collapse.Item name='1' header={t`背景`}>
          <Grid.Row>
            <Grid.Col span={11}>
              <BackgroundColor />
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
