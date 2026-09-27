import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';
import type { CSSProperties } from 'react';

export type IImage = IBlockData<{
  alt?: string;
  src?: string;
  title?: string;
  href?: string;
  target?: string;
  border?: string;
  height?: string;
  'text-decoration'?: string;
  'text-transform'?: CSSProperties['textTransform'];
  align?: CSSProperties['textAlign'];
  'container-background-color'?: string;
  width?: string;
  padding?: string;
}>;

export const imageDefinition: BlockDefinition<IImage> = {
get name() {
    return t({ context: 'block.name', message: '图片' });
  },
  type: BasicType.IMAGE,
  create: payload => {
    const defaultData: IImage = {
      type: BasicType.IMAGE,
      data: {
        value: {},
      },
      attributes: {
        align: 'center',
        height: 'auto',
        padding: '10px 25px 10px 25px',
        src: '',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
};
