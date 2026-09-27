import { Collapse, Grid, Space, Switch } from '@panels/panel-deps';
import { Form } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Padding } from '@panels/panel-deps';
import { Background } from '@panels/panel-deps';
import { Border } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';
import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { BasicType } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '@wa-dev/email-editor-blocks-react';
import { ClassName } from '@panels/panel-deps';
import { CollapseWrapper } from '@panels/panel-deps';
import { TextField } from '@panels/panel-deps';
import { pairedFormItem, panelVerticalSpaceProps } from '@panels/shared/pairedFormItem';

export function SectionPanel() {
  const { focusBlock, setFocusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const noWrap = focusBlock?.data.value.noWrap;

  const onChange = useMemoizedFn(checked => {
    if (!focusBlock) return;
    focusBlock.data.value.noWrap = checked;
    if (checked) {
      const children = [...focusBlock.children];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child) continue;
        if (child.type === BasicType.GROUP) {
          children.splice(i, 1, ...child.children);
        }
      }
      focusBlock.children = [
        getBlockByType(BasicType.GROUP)!.create({
          children: children,
        }),
      ];
    } else {
      if (
        focusBlock.children.length === 1 &&
        focusBlock.children[0].type === BasicType.GROUP
      ) {
        focusBlock.children = focusBlock.children[0]?.children || [];
      }
    }
    setFocusBlock({ ...focusBlock });
  });

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={t`尺寸`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Grid.Row align='stretch'>
              <Grid.Col span={11}>
                <Form.Item
                  label={t`分组`}
                  {...pairedFormItem}
                >
                  <Switch
                    checked={noWrap}
                    textInside
                    onChange={onChange}
                  />
                </Form.Item>
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <TextField
                  label={t`全宽`}
                  name={`${focusIdx}.attributes.full-width`}
                  formItem={pairedFormItem}
                />
              </Grid.Col>
            </Grid.Row>

            <Padding />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={t`背景`}
        >
          <Space {...panelVerticalSpaceProps}>
            <Background />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='2'
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
