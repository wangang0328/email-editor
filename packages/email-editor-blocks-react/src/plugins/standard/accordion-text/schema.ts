import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IAccordionText = IBlockData<
  {
    color?: string;
    'background-color'?: string;
    'font-size'?: string;
    'font-family'?: string;
    padding?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
  },
  { content: string }
>;

export const accordionTextDefinition: BlockDefinition<IAccordionText> = {
get name() {
    return t`折叠面板文本`;
  },
  type: BasicType.ACCORDION_TEXT,
  create: (payload) => {
    const defaultData: IAccordionText = {
      type: BasicType.ACCORDION_TEXT,
      data: {
        value: {
          content:
            'Because emails with a lot of content are most of the time a very bad experience on mobile, mj-accordion comes handy when you want to deliver a lot of information in a concise way',
        },
      },
      attributes: {
        'font-size': '13px',
        padding: '16px 16px 16px 16px',
        'line-height': '1',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
};
