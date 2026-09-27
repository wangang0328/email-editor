import {
  Align,
  AttributesPanelWrapper,
  Button,
  Collapse,
  CollapseWrapper,
  Color,
  ColorPickerField,
  ContainerBackgroundColor,
  FontFamily,
  FontSize,
  FontStyle,
  Grid,
  LineHeight,
  NumberField,
  Padding,
  Space,
  TextField,
  Width,
  pixelAdapter,
  Switch,
} from '@panels/panel-deps';
import { Form } from '@wa-dev/email-editor-ui';
import { Input } from '../../form/Input';
import { ColorPicker } from '../../form/ColorPicker';
import { getMaxTdCount } from '../../table-operation/util';
import {
  appendTableColumn,
  appendTableRow,
  getTableRowBackground,
  removeTableColumn,
  removeTableRow,
  setTableColumnCount,
  setTableRowBackground,
  setTableRowCount,
} from '../../table-operation/tableDataMutations';
import { t, selectOrdinal } from '@lingui/core/macro';
import { Minus, Plus } from 'lucide-react';
import { cloneDeep } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TextStyle, useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import type { AdvancedTableBlock } from '@wa-dev/email-editor-blocks-react';

const fieldFormItem = { labelAlign: 'top' as const };

function TableDimensionControl({
  label,
  count,
  canDecrease,
  onIncrease,
  onDecrease,
  onCountCommit,
}: {
  label: string;
  count: number;
  canDecrease: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onCountCommit: (value: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(count));

  useEffect(() => {
    setInputValue(String(count));
  }, [count]);

  const commitInput = useCallback(() => {
    const parsed = Number.parseInt(inputValue, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setInputValue(String(count));
      return;
    }
    if (parsed !== count) {
      onCountCommit(parsed);
    }
  }, [count, inputValue, onCountCommit]);

  return (
    <Grid.Row align='center'>
      <Grid.Col span={8}>
        <TextStyle>{label}</TextStyle>
      </Grid.Col>
      <Grid.Col span={16}>
        <div className='flex items-center justify-end gap-2'>
          <Button
            size='small'
            icon={<Minus className='h-4 w-4' />}
            disabled={!canDecrease}
            onClick={onDecrease}
          />
          <Input
            type='number'
            min={1}
            value={inputValue}
            style={{ width: 64, textAlign: 'center' }}
            onChange={setInputValue}
            onBlur={commitInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                commitInput();
              }
            }}
          />
          <Button
            size='small'
            icon={<Plus className='h-4 w-4' />}
            onClick={onIncrease}
          />
        </div>
      </Grid.Col>
    </Grid.Row>
  );
}

export function AdvancedTablePanel() {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change } = useBlock();
  const tableBlock = focusBlock as AdvancedTableBlock | null;
  const tableSource = tableBlock?.data?.value?.tableSource ?? [];
  const rowCount = tableSource.length;
  const columnCount = useMemo(() => getMaxTdCount(tableSource), [tableSource]);

  const updateTableSource = useCallback(
    (next: AdvancedTableBlock['data']['value']['tableSource']) => {
      change(`${focusIdx}.data.value.tableSource`, cloneDeep(next));
    },
    [change, focusIdx],
  );

  const handleRowBackgroundChange = useCallback(
    (rowIndex: number, color: string) => {
      updateTableSource(setTableRowBackground(tableSource, rowIndex, color));
    },
    [tableSource, updateTableSource],
  );

  if (!tableBlock) {
    return null;
  }

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item
          name='0'
          header={t`表格`}
        >
          <Space direction='vertical'>
            <Form.Item label={t`首行作为表头`}>
              <Switch
                checked={tableBlock.data.value.headerRow !== false}
                onChange={checked =>
                  change(`${focusIdx}.data.value.headerRow`, checked)
                }
              />
            </Form.Item>
            <TableDimensionControl
              label={t`行数`}
              count={rowCount}
              canDecrease={rowCount > 1}
              onIncrease={() => updateTableSource(appendTableRow(tableSource))}
              onDecrease={() => updateTableSource(removeTableRow(tableSource))}
              onCountCommit={value =>
                updateTableSource(setTableRowCount(tableSource, value))
              }
            />
            <TableDimensionControl
              label={t`列数`}
              count={columnCount}
              canDecrease={columnCount > 1}
              onIncrease={() => updateTableSource(appendTableColumn(tableSource))}
              onDecrease={() => updateTableSource(removeTableColumn(tableSource))}
              onCountCommit={value =>
                updateTableSource(setTableColumnCount(tableSource, value))
              }
            />
          </Space>
        </Collapse.Item>

        {rowCount > 0 ? (
          <Collapse.Item
            name='4'
            header={t`行背景`}
          >
            <Space direction='vertical'>
              {tableSource.map((_, rowIndex) => {
                const row = rowIndex + 1;
                return (
                <Grid.Row
                  key={rowIndex}
                  align='center'
                >
                  <Grid.Col span={7}>
                    <TextStyle variation='strong'>
                      {t({
                        message: selectOrdinal(row, {
                          other: '第 # 行',
                        }),
                      })}
                    </TextStyle>
                  </Grid.Col>
                  <Grid.Col span={17}>
                    <ColorPicker
                      label=''
                      showInput
                      value={getTableRowBackground(tableSource, rowIndex) ?? ''}
                      onChange={color => handleRowBackgroundChange(rowIndex, color)}
                    />
                  </Grid.Col>
                </Grid.Row>
                );
              })}
            </Space>
          </Collapse.Item>
        ) : null}

        <Collapse.Item
          name='1'
          header={t`尺寸`}
        >
          <Space direction='vertical'>
            <Width unitOptions='percent' />
            <Padding />
            <NumberField
              label={t`单元格内边距 (px)`}
              name={`${focusIdx}.attributes.cellPadding`}
              config={pixelAdapter}
              max={20}
              min={0}
              step={1}
            />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={t`装饰`}
        >
          <Color />
          <ContainerBackgroundColor />
          <TextField
            label={t`表格外边框`}
            name={`${focusIdx}.attributes.border`}
          />
          <ColorPickerField
            label={t`单元格边框颜色`}
            name={`${focusIdx}.attributes.cellBorderColor`}
          />
        </Collapse.Item>

        <Collapse.Item
          name='3'
          header={t`排版`}
        >
          <Space direction='vertical'>
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
            <FontStyle formItem={fieldFormItem} />
            <Align
              formItem={fieldFormItem}
              name={`${focusIdx}.attributes.text-align`}
            />
          </Space>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
