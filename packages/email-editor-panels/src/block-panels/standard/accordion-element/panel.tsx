import { Collapse, Space } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React from 'react';
import { Border } from '@panels/panel-deps';
import { BackgroundColor } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { useFocusIdx } from '@wa-dev/email-editor-editor';

export function AccordionElementPanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <Collapse defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item name='0' header={t`设置`}>
          <Space direction='vertical'>
            <Border />
            <BackgroundColor />
            <FontFamily />
          </Space>
        </Collapse.Item>
      </Collapse>
    </AttributesPanelWrapper>
  );
}
