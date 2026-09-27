import { Collapse, Grid, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Padding } from '@panels/panel-deps';

import { BackgroundColor } from '@panels/panel-deps';
import { Color } from '@panels/panel-deps';
import { TextAreaField } from '@panels/panel-deps';
import { FontSize } from '@panels/panel-deps';
import { FontWeight } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { useFocusIdx } from '@wa-dev/email-editor-editor';

export function AccordionTitlePanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <Collapse defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header={t`设置`}>
          <Space direction='vertical'>
            <TextAreaField
              label={t({ context: 'field.content', message: '内容' })}
              name={`${focusIdx}.data.value.content`}
            />

            <Grid.Row>
              <Grid.Col span={11}>
                <Color />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <BackgroundColor />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <FontSize />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <FontFamily />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <FontWeight />
              </Grid.Col>
              <Grid.Col offset={1} span={11} />
            </Grid.Row>

            <Padding title={t`内边距`} attributeName='padding' />
          </Space>
        </Collapse.Item>
      </Collapse>
    </AttributesPanelWrapper>
  );
}
