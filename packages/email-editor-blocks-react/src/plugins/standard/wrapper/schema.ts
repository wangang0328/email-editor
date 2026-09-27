import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';
import type { CSSProperties } from 'react';

export type IWrapper = IBlockData<
  {
    'background-color'?: string;
    border?: string;
    'border-radius'?: string;
    'full-width'?: string;
    direction?: 'ltr' | 'rtl';
    padding?: string;
    'text-align'?: CSSProperties['textAlign'];
  },
  {}
>;

export const wrapperDefinition: BlockDefinition<IWrapper> = {
get name() {
    return t`包装容器`;
  },
  type: BasicType.WRAPPER,
  create: (payload) => {
    const defaultData: IWrapper = {
      type: BasicType.WRAPPER,
      data: {
        value: {},
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE]
};
