import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IAccordionTitle = IBlockData<
  {
    color?: string;
    'background-color'?: string;
    'font-size'?: string;
    'font-family'?: string;
    padding?: string;
  },
  { content: string }
>;

export const accordionTitleDefinition: BlockDefinition<IAccordionTitle> = {
get name() {
    return t`折叠面板标题`;
  },
  type: BasicType.ACCORDION_TITLE,
  create: (payload) => {
    const defaultData: IAccordionTitle = {
      type: BasicType.ACCORDION_TITLE,
      data: {
        value: {
          content: 'Why use an accordion?',
        },
      },
      attributes: {
        'font-size': '13px',
        padding: '16px 16px 16px 16px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
};
