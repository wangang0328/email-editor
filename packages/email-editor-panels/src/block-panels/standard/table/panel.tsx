import { Collapse, Tooltip, Button } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { Stack } from '@wa-dev/email-editor-editor';
import { Code } from 'lucide-react';
import { useState } from 'react';
import { Border } from '@panels/panel-deps';
import { Color } from '@panels/panel-deps';
import { ContainerBackgroundColor } from '@panels/panel-deps';
import { FontFamily } from '@panels/panel-deps';
import { FontSize } from '@panels/panel-deps';
import { FontStyle } from '@panels/panel-deps';
import { Padding } from '@panels/panel-deps';
import { TextAlign } from '@panels/panel-deps';
import { Width } from '@panels/panel-deps';
import { HtmlEditor } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';

export function TablePanel() {
  const [visible, setVisible] = useState(false);

  return (
    <AttributesPanelWrapper
      extra={
        <Tooltip content={t`编辑`}>
          <Button
            onClick={() => setVisible(true)}
            icon={<Code size={16} />}
          />
        </Tooltip>
      }
    >
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item
          name='1'
          header={t`尺寸`}
        >
          <Stack>
            <Width />
            <Stack.Item />
          </Stack>
          <Stack vertical>
            <Padding />
          </Stack>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`装饰`}
        >
          <Color />
          <ContainerBackgroundColor />
          <Border />
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`排版`}
        >
          <Stack>
            <FontFamily />
            <FontSize />
          </Stack>
          <FontStyle />
          <TextAlign />
        </Collapse.Item>
      </CollapseWrapper>
      <HtmlEditor
        visible={visible}
        setVisible={setVisible}
      />
    </AttributesPanelWrapper>
  );
}
