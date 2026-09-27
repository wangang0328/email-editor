import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IText } from './schema';

export const textRender: IBlock<IText>['render'] = (params) => {
    const { data } = params;
    return (
      <BasicBlock
        params={params}
        tag='mj-text'
      >
        {data.data.value.content}
      </BasicBlock>
    );
  };
