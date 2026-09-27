import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IWrapper } from './schema';

export const wrapperRender: IBlock<IWrapper>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-wrapper" />;
  };
