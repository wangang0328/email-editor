import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { ITable } from './schema';

export const tableRender: IBlock<ITable>['render'] = (params) => {
    const { data } = params;
    return (
      <BasicBlock
        params={params}
        tag='mj-table'
      >
        {data.data.value.content}
      </BasicBlock>
    );
  };
