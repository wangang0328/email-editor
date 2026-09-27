import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type ITemplate = IBlockData<
  {},
  {
    idx?: string | null;
  }
>;

export const templateDefinition: BlockDefinition<ITemplate> = {
get name() {
    return t`模板`;
  },
  type: BasicType.TEMPLATE,
  create: (payload) => {
    const defaultData: ITemplate = {
      type: BasicType.TEMPLATE,
      data: {
        value: {
          idx: '',
        },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: []
};
