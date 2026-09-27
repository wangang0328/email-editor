import { t } from '@lingui/core/macro';
import { merge } from 'lodash-es';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData, RecursivePartial } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';

export type IButton = IBlockData<
  {
    align?: string;
    color?: string;
    'background-color'?: string;
    'container-background-color'?: string;
    border?: string;
    'border-radius'?: string;
    href?: string;
    rel?: string;
    target?: string;
    title?: string;
    padding?: string;
    'inner-padding'?: string;
    'text-align'?: string;
    'vertical-align'?: 'middle' | 'top' | 'bottom';
    width?: string;
    'font-family'?: string;
    'font-size'?: string;
    'font-style'?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    height?: string;
    'text-decoration'?: string;
    'text-transform'?: string;
  },
  { content: string }
>;

export const buttonDefinition: BlockDefinition<IButton> = {
  get name() {
    return t`按钮`;
  },
  type: BasicType.BUTTON,
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  create(payload) {
    const defaultData: IButton = {
      type: BasicType.BUTTON,
      data: {
        value: {
          content: 'Button',
        },
      },
      attributes: {
        align: 'center',
        'background-color': '#414141',
        color: '#ffffff',
        'font-size': '13px',
        'font-weight': 'normal',
        'border-radius': '3px',
        padding: '10px 25px 10px 25px',
        'inner-padding': '10px 25px 10px 25px',
        'line-height': '120%',
        target: '_blank',
        'vertical-align': 'middle',
        border: 'none',
        'text-align': 'center',
        href: '#',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
};
