import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IRaw } from './schema';

export const rawRender: IBlock<IRaw>['render'] = (params) => {
    return (
      <BasicBlock
        params={params}
        tag='mj-raw'
      >
        {params.data.data.value.content}
      </BasicBlock>
    );
  };
