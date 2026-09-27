import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { ICarousel } from './schema';

export const carouselRender: IBlock<ICarousel>['render'] = (params) => {
    const { data } = params;
    const carouselImages = (data ).data.value.images
      .map((image) => {
        const imageAttributeStr = Object.keys(image)
          .filter((key) => key !== 'content' && image[key as keyof typeof image] !== '') // filter att=""
          .map((key) => `${key}="${image[key as keyof typeof image]}"`)
          .join(' ');
        return `
      <mj-carousel-image ${imageAttributeStr} />
      `;
      })
      .join('\n');
    return <BasicBlock params={params} tag="mj-carousel">{carouselImages}</BasicBlock>;
  };
