import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { ISpacer } from './schema';

export const spacerRender: IBlock<ISpacer>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-spacer" />;
  };
