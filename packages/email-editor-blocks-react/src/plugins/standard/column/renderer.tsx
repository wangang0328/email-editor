import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IColumn } from './schema';

export const columnRender: IBlock<IColumn>['render'] = (params) => {
    return (
      <BasicBlock
        params={params}
        tag='mj-column'
      />
    );
  };
