import React from 'react';
import { BlockRenderer } from '@blocks/mjml/BlockRenderer';
import { getAdapterAttributesString } from '@blocks/utils/getAdapterAttributesString';
import { generaMjmlMetaData } from '@blocks/utils/generaMjmlMetaData';
import { getChildIdx, getPageIdx } from '@wa-dev/email-editor-shared';
import type { IBlock } from '@blocks/typings';
import type { IPage } from './schema';

export const pageRender: IBlock<IPage>['render'] = (params) => {
    const { data } = params;
    const metaData = generaMjmlMetaData(data);
    const value = data.data.value;

    const breakpoint = value.breakpoint
      ? `<mj-breakpoint width="${data.data.value.breakpoint}" />`
      : '';

    const nonResponsive = !value.responsive
      ? `<mj-raw>
            <meta name="viewport" />
           </mj-raw>
           <mj-style inline="inline">.mjml-body { width: ${
             data.attributes.width || '600px'
           }; margin: 0px auto; }</mj-style>`
      : '';
    const styles =
      value.headStyles
        ?.map(
          style =>
            `<mj-style ${style.inline ? 'inline="inline"' : ''}>${
              style.content
            }</mj-style>`,
        )
        .join('\n') || '';

    const userStyle = value['user-style']
      ? `<mj-style ${value['user-style'].inline ? 'inline="inline"' : ''}>${
          value['user-style'].content
        }</mj-style>`
      : '';

    const extraHeadContent = value.extraHeadContent
      ? `<mj-raw>${value.extraHeadContent}</mj-raw>`
      : '';

    return (
      <>
        {`
          <mjml>
          <mj-head>
              ${metaData}
              ${nonResponsive}
              ${styles}
              ${userStyle}
              ${breakpoint}
              ${extraHeadContent}
              ${value.fonts
                ?.filter(Boolean)
                .map(item => `<mj-font name="${item.name}" href="${item.href}" />`)}
            <mj-attributes>
              ${value.headAttributes}
              ${
                value['font-family']
                  ? `<mj-all font-family="${value['font-family'].replace(/"/gm, '')}" />`
                  : ''
              }
              ${value['font-size'] ? `<mj-text font-size="${value['font-size']}" />` : ''}
              ${value['text-color'] ? `<mj-text color="${value['text-color']}" />` : ''}
        ${value['line-height'] ? `<mj-text line-height="${value['line-height']}" />` : ''}
        ${value['font-weight'] ? `<mj-text font-weight="${value['font-weight']}" />` : ''}
              ${
                value['content-background-color']
                  ? `<mj-wrapper background-color="${value['content-background-color']}" />
             <mj-section background-color="${value['content-background-color']}" />
            `
                  : ''
              }

            </mj-attributes>
          </mj-head>
          <mj-body ${getAdapterAttributesString(params)}>`}

        {data.children.map((child, index) => (
          <BlockRenderer
            {...params}
            idx={getChildIdx(getPageIdx(), index)}
            key={index}
            data={child}
          />
        ))}

        {'</mj-body></mjml > '}
      </>
    );
  };
