import React from 'react';
import { BlockRenderer } from '@blocks/mjml/BlockRenderer';
import type { IBlock } from '@blocks/typings';
import type { ITemplate } from './schema';

export const templateRender: IBlock<ITemplate>['render'] = (params) => {
    const { data } = params;
    return (
      <>
        {`
          ${data.children.map((child) => (
          <BlockRenderer {...params} data={child} />
        ))}
        `}
      </>
    );
  };
