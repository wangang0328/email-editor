import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IDivider = IBlockData<
  {
    'border-color'?: string;
    'border-style'?: string;
    'border-width'?: string;
    'container-background-color'?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    padding?: string;
  },
  {}
>;

export const dividerDefinition: BlockDefinition<IDivider> = {
get name() {
    return t`分隔线`;
  },
  type: BasicType.DIVIDER,
  create: (payload) => {
    const defaultData: IDivider = {
      type: BasicType.DIVIDER,
      data: {
        value: {},
      },
      attributes: {
        align: 'center',
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#C9CCCF',
        padding: '10px 0px 10px 0px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
};
