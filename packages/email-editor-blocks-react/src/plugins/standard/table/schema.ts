import { t } from '@lingui/core/macro';
import { AdvancedType, BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type ITable = IBlockData<{}, { content: string }>;

export const tableDefinition: BlockDefinition<ITable> = {
get name() {
    return t`表格`;
  },
  type: BasicType.TABLE,
  create: payload => {
    const defaultData: ITable = {
      type: BasicType.TABLE,
      data: {
        value: {
          content: '',
        },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, AdvancedType.COLUMN],
};
