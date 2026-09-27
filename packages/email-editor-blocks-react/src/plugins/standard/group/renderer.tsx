import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IGroup } from './schema';

export const groupRender: IBlock<IGroup>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-group" />;
  };
