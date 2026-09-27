import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import type { IBlock } from '@blocks/typings';
import type { INavbar } from './schema';

export const navbarRender: IBlock<INavbar>['render'] = (params) => {
    const { data } = params;
    const links = (data ).data.value.links
      .map((link, index) => {
        const linkAttributeStr = Object.keys(link)
          .filter((key) => key !== 'content' && link[key as keyof typeof link] !== '') // filter att=""
          .map((key) => `${key}="${link[key as keyof typeof link]}"`)
          .join(' ');
        return `
          <mj-navbar-link ${linkAttributeStr}>${link.content}</mj-navbar-link>
          `;
      })
      .join('\n');
    return <BasicBlock params={params} tag="mj-navbar">{links}</BasicBlock>;

  };
