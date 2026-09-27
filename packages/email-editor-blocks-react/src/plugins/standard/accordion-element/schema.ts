import { t } from '@lingui/core/macro';
import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@blocks/typings';
import type { BlockDefinition } from '@blocks/plugins/types';
import { merge } from 'lodash-es';

export type IAccordionElement = IBlockData<
  {
    'icon-width': string;
    'icon-height': string;
    'container-background-color'?: string;
    border?: string;
    'inner-padding'?: string;
    'font-family'?: string;
    'icon-align'?: 'middle' | 'top' | 'bottom';
    'icon-position': 'left' | 'right';
    'icon-unwrapped-alt'?: string;
    'icon-unwrapped-url'?: string;
    'icon-wrapped-alt'?: string;
    'icon-wrapped-url'?: string;
  },
  {}
>;

export const accordionElementDefinition: BlockDefinition<IAccordionElement> = {
get name() {
    return t`折叠面板元素`;
  },
  type: BasicType.ACCORDION_ELEMENT,
  create: (payload) => {
    const defaultData: IAccordionElement = {
      type: BasicType.ACCORDION_ELEMENT,
      data: {
        value: {},
      },
      attributes: {
        'icon-align': 'middle',
        'icon-height': '32px',
        'icon-width': '32px',

        'icon-position': 'right',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
};
