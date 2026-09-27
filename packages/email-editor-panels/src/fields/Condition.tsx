import { List } from '@wa-dev/email-editor-ui';
import { Collapse, Grid, Switch, Button, Space, Message } from '@wa-dev/email-editor-ui';
import { Trash2, Plus } from 'lucide-react';
import { t } from '@lingui/core/macro';
import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import {
  AdvancedBlock,
  OperatorSymbol,
  AdvancedType,
  Operator,
  ICondition,
  IConditionGroup,
} from '@wa-dev/email-editor-blocks-react';

import { SelectField, TextField } from '@panels/form';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { cloneDeep, get, upperFirst } from 'lodash-es';

import { useField } from 'react-final-form';
import type { AttributeFormItemProps } from './types';

export function Condition({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change, values } = useBlock();
  const condition = focusBlock?.data.value?.condition as
    | undefined
    | AdvancedBlock['data']['value']['condition'];

  const enabled = Boolean(condition && condition.enabled);

  const onConditionToggle = useMemoizedFn((enabled: boolean) => {
    if (enabled) {
      if (!condition) {
        change(`${focusIdx}.data.value.condition`, {
          enabled: true,
          symbol: OperatorSymbol.AND,
          groups: [
            {
              symbol: OperatorSymbol.AND,
              groups: [
                {
                  left: '',
                  operator: Operator.TRUTHY,
                  right: ''
                }
              ],
            }
          ] as unknown[],
        } as ICondition);
      }
    }
    change(`${focusIdx}.data.value.condition.enabled`, enabled);
  });

  const onAddCondition = useMemoizedFn((path: string) => {
    const groups = get(values, path) as IConditionGroup[];

    groups.push({
      symbol: OperatorSymbol.AND,
      groups: [
        {
          left: '',
          operator: Operator.TRUTHY,
          right: ''
        }
      ],
    });
    change(path, [...groups]);
  });

  const onAddSubCondition = useMemoizedFn((path: string) => {
    const groups = get(values, path) as IConditionGroup['groups'];

    groups.push({
      left: '',
      operator: Operator.TRUTHY,
      right: ''

    });
    change(path, [...groups]);
  });

  // content.children.[0].children.[0].data.value.condition.groups.1.groups
  const onDelete = useMemoizedFn((path: string, gIndex: number, ggIndex: number) => {
    if (!condition) return;
    const subPath = `${path}.${gIndex}.groups`;
    const groups = cloneDeep(get(values, path)) as any[];
    const subGroups = cloneDeep(get(values, subPath)) as any[];

    subGroups.splice(ggIndex, 1);
    if (subGroups.length === 0) {
      if (groups.length === 1) {
        Message.warning(t`至少需要一个条件`);
        return;
      }
      // remove empty array
      groups.splice(gIndex, 1);
      change(path, [...groups]);
    } else {
      change(subPath, [...subGroups]);
    }

  });

  if (
    !focusBlock?.type ||
    !Object.values(AdvancedType).includes(focusBlock?.type as any)
  ) {
    return null;
  }

  const isEmpty = !condition?.groups.length;

  return (
    <Collapse.Item
      contentStyle={{
        paddingLeft: 10
      }}
      className='condition'
      destroyOnHide
      name='Condition'
      header={t`条件`}
      extra={(
        <div style={{ marginRight: 10 }}>
          <Switch checked={condition?.enabled} onChange={onConditionToggle} />
        </div>
      )}
    >

      {condition?.enabled && (
        <Space direction='vertical' size='large'>

          <List
            header={(
              <Grid.Row justify='space-between'>
                <Grid.Col span={16}>
                  {condition.groups.length > 1 && (
                    <SelectField inline name={`${focusIdx}.data.value.condition.symbol`}
                      label={t`符号`}
                      options={[
                        {
                          label: t`且`,
                          value: OperatorSymbol.AND
                        },
                        {
                          label: t`或`,
                          value: OperatorSymbol.OR
                        },
                      ]}
                      formItem={formItem}
                    />
                  )}
                </Grid.Col>
                <Button onClick={() => onAddCondition(`${focusIdx}.data.value.condition.groups`)} size='small' icon={<Plus className="h-4 w-4" />} />
              </Grid.Row>
            )}
            dataSource={condition.groups}
            render={
              (group, gIndex) => {
                return (
                  <List.Item key={gIndex}>
                    <div>
                      <Grid.Row justify='space-between'>
                        <Grid.Col span={16}>
                          {
                            group.groups.length > 1 && (
                              <SelectField inline name={`${focusIdx}.data.value.condition.symbol`}
                                label={t`符号`}
                                options={[
                                  {
                                    label: t`且`,
                                    value: OperatorSymbol.AND
                                  },
                                  {
                                    label: t`或`,
                                    value: OperatorSymbol.OR
                                  },
                                ]}
                                formItem={formItem}
                              />
                            )
                          }
                        </Grid.Col>
                        <Button size='small' icon={<Plus className="h-4 w-4" />} onClick={() => onAddSubCondition(`${focusIdx}.data.value.condition.groups.${gIndex}.groups`)} />
                      </Grid.Row>
                      {
                        group.groups.map((item, ggIndex) => (
                          <ConditionItem
                            onDelete={onDelete}
                            path={`${focusIdx}.data.value.condition.groups`}
                            gIndex={gIndex}
                            ggIndex={ggIndex}
                            formItem={formItem}
                            key={ggIndex}
                          />
                        ))
                      }

                    </div>
                  </List.Item>
                );
              }
            }
          />

        </Space>
      )}
    </Collapse.Item>
  );
}

const options = Object.values(Operator).map(item => ({ label: upperFirst(item), value: item }));

function ConditionItem({
  path,
  onDelete,
  gIndex,
  ggIndex,
  formItem,
}: {
  path: string;
  gIndex: number;
  ggIndex: number;
  formItem?: AttributeFormItemProps['formItem'];
  onDelete: (path: string, gIndex: number, ggIndex: number,) => void;
}) {

  const name = `${path}.${gIndex}.groups.${ggIndex}`;
  const { input: { value } } = useField(name);

  const hideRight = value.operator === Operator.TRUTHY || value.operator === Operator.FALSY;

  return (
    <Grid.Row align='end'>
      <Grid.Col span={7}> <TextField label={t`变量路径`} name={`${name}.left`} formItem={formItem} /></Grid.Col>
      <Grid.Col span={7}> <SelectField label={t`运算符`} name={`${name}.operator`} options={options} formItem={formItem} /></Grid.Col>
      <Grid.Col span={7}> {!hideRight && <TextField label={t`比较值`} name={`${name}.right`} formItem={formItem} />}</Grid.Col>
      <Grid.Col span={3}>
        <Button onClick={() => onDelete(path, gIndex, ggIndex)} icon={<Trash2 className="h-4 w-4" />} />
      </Grid.Col>

    </Grid.Row>
  );
}