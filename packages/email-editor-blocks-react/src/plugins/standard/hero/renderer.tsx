import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { IHero } from './schema';

export const heroRender: IBlock<IHero>['render'] = (params) => {
    return <BasicBlock params={params} tag="mj-hero" />;
  };
