import { Form, Grid, Space, Switch } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import { useMemo } from 'react';
import { Stack, useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { Select } from '@panels/form/Select';
import { Input } from '@panels/form/Input';
import { ColorPicker } from '@panels/form/ColorPicker';
import { pairedFormItem } from '@panels/shared/pairedFormItem';
import type { AttributeFormItemProps } from './types';
import {
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_STYLE,
  DEFAULT_BORDER_WIDTH,
  formatBorder,
  formatBorderRadius,
  parseBorder,
  parseBorderRadius,
} from './border.utils';

const borderStyleOptions = [
  {
    value: 'solid',
    get label() {
      return t`实线`;
    },
  },
  {
    value: 'dashed',
    get label() {
      return t`虚线`;
    },
  },
  {
    value: 'dotted',
    get label() {
      return t`点线`;
    },
  },
];

export function Border({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change } = useBlock();

  const borderAttr = focusBlock?.attributes?.border as string | undefined;
  const radiusAttr = focusBlock?.attributes?.['border-radius'] as string | undefined;

  const parsed = useMemo(() => parseBorder(borderAttr), [borderAttr]);
  const radius = useMemo(() => parseBorderRadius(radiusAttr), [radiusAttr]);

  const itemProps = useMemo(
    () => ({
      labelAlign: 'top' as const,
      ...formItem,
    }),
    [formItem],
  );

  const updateBorder = useMemoizedFn((width: string, style: string, color: string) => {
    if (!focusIdx) return;
    change(
      `${focusIdx}.attributes.border`,
      formatBorder(width, style, color),
    );
  });

  const onToggle = useMemoizedFn((checked: boolean) => {
    if (!focusIdx) return;
    if (checked) {
      updateBorder(
        parsed.width || DEFAULT_BORDER_WIDTH,
        parsed.style || DEFAULT_BORDER_STYLE,
        parsed.color || DEFAULT_BORDER_COLOR,
      );
    } else {
      change(`${focusIdx}.attributes.border`, 'none');
    }
  });

  const onStyleChange = useMemoizedFn((style: string) => {
    updateBorder(parsed.width, style, parsed.color);
  });

  const onWidthChange = useMemoizedFn((width: string) => {
    updateBorder(width, parsed.style, parsed.color);
  });

  const onColorChange = useMemoizedFn((color: string) => {
    updateBorder(parsed.width, parsed.style, color);
  });

  const onRadiusChange = useMemoizedFn((val: string) => {
    if (!focusIdx) return;
    const next = formatBorderRadius(val);
    change(`${focusIdx}.attributes.border-radius`, next ?? '');
  });

  return (
    <Stack key={focusIdx} vertical spacing='tight'>
      <Grid.Row align='stretch'>
        <Grid.Col span={11}>
          <Form.Item
            label={t`圆角`}
            {...itemProps}
            {...pairedFormItem}
          >
            <Input
              type='number'
              suffix='px'
              value={radius}
              onChange={onRadiusChange}
              autoComplete='off'
            />
          </Form.Item>
        </Grid.Col>
        <Grid.Col
          offset={1}
          span={11}
        >
          <Form.Item
            label={t`边框`}
            {...itemProps}
            {...pairedFormItem}
          >
            <Switch
              checked={parsed.enabled}
              onChange={onToggle}
            />
          </Form.Item>
        </Grid.Col>
      </Grid.Row>

      {parsed.enabled ? (
        <Space direction='vertical' style={{ width: '100%' }}>
          <Form.Item label={t`样式`} {...itemProps}>
            <Select
              value={parsed.style}
              onChange={onStyleChange}
              options={borderStyleOptions}
            />
          </Form.Item>

          <Form.Item label={t`尺寸`} {...itemProps}>
            <Input
              type='number'
              suffix='px'
              value={parsed.width}
              onChange={onWidthChange}
              autoComplete='off'
            />
          </Form.Item>

          <Form.Item label={t`颜色`} {...itemProps}>
            <ColorPicker
              label={t`颜色`}
              value={parsed.color || DEFAULT_BORDER_COLOR}
              onChange={onColorChange}
            />
          </Form.Item>
        </Space>
      ) : null}
    </Stack>
  );
}
