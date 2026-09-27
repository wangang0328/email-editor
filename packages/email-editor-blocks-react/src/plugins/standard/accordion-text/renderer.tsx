import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IAccordionText } from './schema';

export const accordionTextRender: IBlock<IAccordionText>['render'] = (params) => {
    return (
      <BasicBlock params={params} tag='mj-accordion-text'>
        {params.data.data.value.content}
      </BasicBlock>
    );
  };
