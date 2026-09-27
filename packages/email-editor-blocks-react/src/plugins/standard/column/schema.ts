import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IColumn = IBlockData<
  {
    'background-color'?: string;
    border?: string;
    'border-radius'?: string;
    'inner-border'?: string;
    'inner-border-radius'?: string;
    padding?: string;
    'text-align'?: string;
    'vertical-align'?: string;
    width?: string;
  },
  {}
>;

export const columnDefinition: BlockDefinition<IColumn> = {
get name() {
    return t`列`;
  },
  type: BasicType.COLUMN,
  create: payload => {
    const defaultData: IColumn = {
      type: BasicType.COLUMN,
      data: {
        value: {},
      },
      attributes: {
        padding: '0px 0px 0px 0px',
        border: 'none',
        'vertical-align': 'top',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.SECTION, BasicType.GROUP]
};
