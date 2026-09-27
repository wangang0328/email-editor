import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { mergeBlock } from '@wa-dev/email-editor-shared';

export type INavbar = IBlockData<
  {
    align?: string;
    hamburger?: string;
    'ico-align'?: string;
    'ico-color'?: string;
    'ico-font-size'?: string;
    'ico-line-height'?: string;
    'ico-padding'?: string;
    'ico-text-decoration'?: string;
    'ico-text-transform'?: string;
  },
  {
    links: Array<{
      content: string;
      color?: string;
      href?: string;
      'font-family'?: string;
      'font-size'?: string;
      'font-style'?: string;
      'font-weight'?: string;
      'line-height'?: string;
      'text-decoration'?: string;
      target?: string;
      padding?: string;
    }>;
  }
>;

export const navbarDefinition: BlockDefinition<INavbar> = {
get name() {
    return t`导航栏`;
  },
  type: BasicType.NAVBAR,
  create: (payload) => {
    const defaultData: INavbar = {
      type: BasicType.NAVBAR,
      data: {
        value: {
          links: [
            {
              href: '/gettings-started-onboard',
              content: 'Getting started',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/try-it-live',
              content: 'Try it live',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/templates',
              content: 'Templates',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
            {
              href: '/components',
              content: 'Components',
              color: '#1890ff',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px',
            },
          ],
        },
      },
      attributes: {
        align: 'center',
      },
      children: [],
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
};
