import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { ISection } from './schema';

export const sectionRender: IBlock<ISection>['render'] = (params) => {
    return (
      <BasicBlock
        params={params}
        tag='mj-section'
      />
    );
  };
