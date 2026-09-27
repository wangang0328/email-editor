import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type ISpacer = IBlockData<{
  'container-background-color'?: string;
  height?: string;
  padding?: string;
}>;

export const spacerDefinition: BlockDefinition<ISpacer> = {
get name() {
    return t`间隔`;
  },
  type: BasicType.SPACER,
  create: (payload) => {
    const defaultData: ISpacer = {
      type: BasicType.SPACER,
      data: {
        value: {},
      },
      attributes: {
        height: '20px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
};
