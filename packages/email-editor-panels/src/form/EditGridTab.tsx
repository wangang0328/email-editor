import { Card, Typography } from '@wa-dev/email-editor-ui';
import { Space } from '@wa-dev/email-editor-ui';
import { X, Plus } from 'lucide-react';
import { t, selectOrdinal } from '@lingui/core/macro';
import type { TabsProps } from '@wa-dev/email-editor-ui';
import { cloneDeep } from 'lodash-es';
import React from 'react';

export interface EditGridTabProps<T extends any = any>
  extends Omit<TabsProps, 'onChange'> {
  value: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  onChange: (vals: Array<T>) => any;
  additionItem?: T;
  label: string;
}

const iconBtnClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--color-text-2,#4e5969)] transition-colors hover:border-[var(--color-border-2,#e5e6eb)] hover:text-[var(--color-text-1,#1d2129)]';

export function EditGridTab<T extends any = any>(props: EditGridTabProps<T>) {
  const { value, additionItem } = props;

  const onAdd = (index: number) => {
    let newItem = additionItem || cloneDeep(value[index]);
    value.splice(index + 1, 0, newItem);
    props.onChange([...value]);
  };

  const onDelete = (index: number) => {
    props.onChange(value.filter((_, vIndex) => Number(index) !== vIndex));
  };
  return (
    <Card bordered={false}>
      {(Array.isArray(value) ? value : []).map((item, index) => {
        const itemNo = index + 1;
        return (
          <Card.Grid style={{ width: '100%' }} key={index}>
            <Card
              title={(
                <Space>
                  <Typography.Text>
                    {t({
                      message: selectOrdinal(itemNo, {
                        other: '第 # 项',
                      }),
                    })}
                  </Typography.Text>
                </Space>
              )}
              extra={(
                <Space size="small">
                  <button
                    type="button"
                    className={iconBtnClass}
                    aria-label={t`添加项`}
                    onClick={() => onAdd(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={iconBtnClass}
                    aria-label={t`删除项`}
                    onClick={() => onDelete(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Space>
              )}
            >
              {props.renderItem(item, index)}
            </Card>
          </Card.Grid>
        );
      })}
    </Card>
  );
}
