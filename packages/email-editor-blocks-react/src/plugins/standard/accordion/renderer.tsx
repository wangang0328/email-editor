import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IAccordion } from './schema';

export const accordionRender: IBlock<IAccordion>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-accordion" />;
  };
