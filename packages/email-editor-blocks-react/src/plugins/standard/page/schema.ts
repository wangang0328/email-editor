import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';
import { wrapperDefinition } from '@blocks/plugins/standard/wrapper/schema';

export type IPage = IBlockData<
  {
    'background-color'?: string;
    width: string;
  },
  {
    breakpoint?: string;
    headAttributes: string;
    fonts?: { name: string; href: string }[];
    headStyles?: {
      content?: string;
      inline?: 'inline';
    }[];
    extraHeadContent?: string;
    responsive?: boolean;
    'font-family': string;
    'font-size': string;
    'font-weight': string;
    'line-height': string;
    'text-color': string;
    'user-style'?: {
      content?: string;
      inline?: 'inline';
    };
    'content-background-color'?: string;
  }
>;

export const pageDefinition: BlockDefinition<IPage> = {
get name() {
    return t`页面`;
  },
  type: BasicType.PAGE,
  create: payload => {
    const defaultData: IPage = {
      type: BasicType.PAGE,
      data: {
        value: {
          breakpoint: '480px',
          headAttributes: '',
          'font-size': '14px',
          'font-weight': '400',
          'line-height': '1.7',
          headStyles: [],
          fonts: [],
          responsive: true,
          'font-family':
            '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\',\'Helvetica Neue\', sans-serif',
          'text-color': '#000000',
        },
      },
      attributes: {
        'background-color': '#ffffff',
        width: '600px',
      },
      children: [wrapperDefinition.create()],
    };
    return merge(defaultData, payload);
  },
  validParentType: []
};
