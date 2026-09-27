import { t } from '@lingui/core/macro';
import { AdvancedType, BasicType, getParentByIdx } from '@wa-dev/email-editor-shared';
import { IBlockData } from '@blocks/typings';
import { createCustomBlock } from '@blocks/utils/createCustomBlock';
import { merge } from 'lodash-es';
import React from 'react';
import { BasicBlock } from '@blocks/mjml/BasicBlock';
import MjmlBlock from '@blocks/mjml/MjmlBlock';

export function generateAdvancedTableBlock(option: {
  type: string;
  baseType: BasicType;
}) {
  return createCustomBlock<AdvancedTableBlock>({
    get name() {
      return t`表格`;
    },
    type: option.type,
    // 与 generateAdvancedContentBlock 对齐：画布上列多为 advanced_column，
    // 若只认 BasicType.COLUMN，落点会抬到 PAGE 并 autocomplete 包一层新 section，
    // 表现为「拖入 table 顶掉/弄丢其它块」。
    validParentType: [
      BasicType.PAGE,
      BasicType.WRAPPER,
      BasicType.COLUMN,
      BasicType.GROUP,
      BasicType.HERO,
      AdvancedType.WRAPPER,
      AdvancedType.COLUMN,
      AdvancedType.GROUP,
      AdvancedType.HERO,
    ],
    create: payload => {
      const defaultData: AdvancedTableBlock = {
        type: option.type,
        data: {
          value: {
            headerRow: true,
            tableSource: [
              [{ content: 'header1' }, { content: 'header2' }, { content: 'header3' }],
              [{ content: 'body1-1' }, { content: 'body1-2' }, { content: 'body1-3' }],
              [{ content: 'body2-1' }, { content: 'body2-2' }, { content: 'body2-3' }],
            ],
          },
        },
        attributes: {
          cellBorderColor: '#000000',
          cellPadding: '8px',
          'text-align': 'center',
        },
        children: [],
      };
      return merge(defaultData, payload);
    },
    render: params => {
      const { data, idx, context } = params;
      const { cellPadding, cellBorderColor } = data.attributes;
      const textAlign = data.attributes['text-align'];
      const fontStyle = data.attributes['font-style'];

      const headerRow = data.data.value.headerRow !== false;
      const content = data.data.value.tableSource
        .map((tr, trIndex) => {
          const styles = [] as string[];
          if (cellPadding) {
            styles.push(`padding: ${cellPadding}`);
          }
          if (cellBorderColor) {
            styles.push(`border: 1px solid ${cellBorderColor}`);
          }
          styles.push('font-size: 13px', 'line-height: 1.5');
          const cellTag = headerRow && trIndex === 0 ? 'th' : 'td';
          const _trString = tr.map((e) => {
            const cellStyles = [...styles];
            if (e.backgroundColor) {
              cellStyles.push(`background-color:${e.backgroundColor}`);
            }
            return `<${cellTag} rowspan="${e.rowSpan || 1}" colspan="${
              e.colSpan || 1
            }" style="${cellStyles.join(';')};">${e.content}</${cellTag}>`;
          });
          return `<tr style="text-align:${textAlign};font-style:${fontStyle};">${_trString.join(
            '\n',
          )}</tr>`;
        })
        .join('\n');

      const tableNode = (
        <BasicBlock
          params={params}
          tag='mj-table'
        >
          {content}
        </BasicBlock>
      );

      const parentBlockData =
        context && idx ? getParentByIdx({ content: context }, idx) : null;
      if (
        parentBlockData &&
        (parentBlockData.type === BasicType.PAGE ||
          parentBlockData.type === BasicType.WRAPPER ||
          parentBlockData.type === AdvancedType.WRAPPER)
      ) {
        return (
          <MjmlBlock
            type={BasicType.SECTION}
            padding='0px'
            text-align='left'
          >
            <MjmlBlock type={BasicType.COLUMN}>{tableNode}</MjmlBlock>
          </MjmlBlock>
        );
      }

      return tableNode;
    },
  });
}

export interface IAdvancedTableData {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  backgroundColor?: string;
}

export type AdvancedTableBlock = IBlockData<
  {
    cellPadding?: string;
    cellBorderColor?: string;
    'font-style'?: string;
    'text-align'?: string;
  },
  {
    content?: string;
    headerRow?: boolean;
    tableSource: IAdvancedTableData[][];
  }
>;
