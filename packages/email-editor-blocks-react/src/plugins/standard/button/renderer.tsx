import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IButton } from './schema';

export const buttonRender: IBlock<IButton>['render'] = params => {
  const { data } = params;
  return (
    <BasicBlock
      params={params}
      tag="mj-button"
    >
      {data.data.value.content}
    </BasicBlock>
  );
};
