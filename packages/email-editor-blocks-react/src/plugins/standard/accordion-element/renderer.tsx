import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IAccordionElement } from './schema';

export const accordionElementRender: IBlock<IAccordionElement>['render'] = (params) => {
    return <BasicBlock params={params} tag='mj-accordion-element' />;
  };
