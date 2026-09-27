import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { ISocial } from './schema';

export const socialRender: IBlock<ISocial>['render'] = (params) => {
    const { data } = params;
    const elements = (data ).data.value.elements
      .map((element) => {
        const elementAttributeStr = Object.keys(element)
          .filter((key) => key !== 'content' && element[key as keyof typeof element] !== '') // filter att=""
          .map((key) => `${key}="${element[key as keyof typeof element]}"`)
          .join(' ');
        return `
          <mj-social-element ${elementAttributeStr}>${element.content ?? ''}</mj-social-element>
          `;
      })
      .join('\n');
    return <BasicBlock params={params} tag="mj-social">{elements}</BasicBlock>;

  };
