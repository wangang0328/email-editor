import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IImage } from './schema';

export const imageRender: IBlock<IImage>['render'] = (params) => {
    return (
      <BasicBlock
        params={params}
        tag='mj-image'
      />
    );
  };
