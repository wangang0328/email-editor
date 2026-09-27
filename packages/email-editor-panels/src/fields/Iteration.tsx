import { Collapse, Grid, Switch } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';

import { AdvancedBlock, AdvancedType } from '@wa-dev/email-editor-blocks-react';
import { TextField } from '@panels/form';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import type { AttributeFormItemProps } from './types';

export function Iteration({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change } = useBlock();
  const iteration = focusBlock?.data.value?.iteration as
    | undefined
    | AdvancedBlock['data']['value']['iteration'];

  const enabled = Boolean(iteration && iteration.enabled);

  const onIterationToggle = useMemoizedFn((enabled: boolean) => {
    if (enabled) {
      if (!iteration) {
        change(`${focusIdx}.data.value.iteration`, {
          enabled: true,
          dataSource: '',
          itemName: 'item',
          limit: 9999,
          mockQuantity: 1,
        } as AdvancedBlock['data']['value']['iteration']);
      }
    }
    change(`${focusIdx}.data.value.iteration.enabled`, enabled);
  });

  if (
    !focusBlock?.type ||
    !Object.values(AdvancedType).includes(focusBlock?.type as any)
  ) {
    return null;
  }

  return (
    <Collapse.Item
      className='iteration'
      destroyOnHide
      name='Iteration'
      header={t`迭代`}
      extra={(
        <div style={{ marginRight: 10 }}>
          <Switch checked={iteration?.enabled} onChange={onIterationToggle} />
        </div>
      )}
    >
      {iteration?.enabled && (
        <Grid.Col span={24}>
          <div>
            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label={t`数据源`}
                  name={`${focusIdx}.data.value.iteration.dataSource`}
                  formItem={formItem}
                />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <TextField
                  label={t`项名称`}
                  name={`${focusIdx}.data.value.iteration.itemName`}
                  formItem={formItem}
                />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label={t`限制数量`}
                  name={`${focusIdx}.data.value.iteration.limit`}
                  quickchange
                  type='number'
                  onChangeAdapter={(v) => Number(v)}
                  formItem={formItem}
                />
              </Grid.Col>
              <Grid.Col offset={1} span={11}>
                <TextField
                  label={t`模拟数量`}
                  max={iteration?.limit}
                  name={`${focusIdx}.data.value.iteration.mockQuantity`}
                  type='number'
                  onChangeAdapter={(v) => Number(v)}
                  quickchange
                  formItem={formItem}
                />
              </Grid.Col>
            </Grid.Row>
          </div>
        </Grid.Col>
      )}
    </Collapse.Item>
  );
}
