import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IAccordionTitle } from './schema';

export const accordionTitleRender: IBlock<IAccordionTitle>['render'] = (params) => {
    return (
      <BasicBlock params={params} tag='mj-accordion-title'>
        {params.data.data.value.content}
      </BasicBlock>
    );
  };
