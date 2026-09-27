import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IText = IBlockData<
  {
    color?: string;
    'font-family'?: string;
    'font-size'?: string;
    'font-style'?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    height?: string;
    'text-decoration'?: string;
    'text-transform'?: string;
    align?: string;
    'container-background-color'?: string;
    width?: string;
    padding?: string;
  },
  {
    content: string;
  }
>;

export const textDefinition: BlockDefinition<IText> = {
get name() {
    return t`文本`;
  },
  type: BasicType.TEXT,
  create: payload => {
    const defaultData: IText = {
      type: BasicType.TEXT,
      data: {
        value: {
          content: t`让每个人都能轻松创建邮件！`,
        },
      },
      attributes: {
        padding: '10px 25px 10px 25px',
        align: 'left',
        'font-size': '14px',
        'line-height': '1.7',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
};
