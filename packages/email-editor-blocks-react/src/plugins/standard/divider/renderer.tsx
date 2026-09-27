import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IDivider } from './schema';

export const dividerRender: IBlock<IDivider>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-divider" />;
  };
