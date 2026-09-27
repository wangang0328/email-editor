import MjmlBlock from '@blocks/mjml/MjmlBlock';
import { BasicType, AdvancedType } from '@wa-dev/email-editor-shared';
import { getDefaultEngine } from '@wa-dev/email-editor-engine';
import { getParentByIdx } from '@wa-dev/email-editor-shared';
import { classnames } from '@wa-dev/email-editor-shared';
import React from 'react';
import { generateAdvancedBlock } from './generateAdvancedBlock';
import { getPreviewClassName } from '@blocks/utils/getPreviewClassName';
import { IBlockData } from '@wa-dev/email-editor-shared';

export function generateAdvancedContentBlock<T extends IBlockData>(option: {
  type: string;
  baseType: BasicType;
}) {
  return generateAdvancedBlock<T>({
    ...option,

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
    getContent: (params) => {
      const { data, idx, mode, context, index } = params;

      const previewClassName =
        mode === 'testing'
          ? classnames(
              index === 0 && idx && getPreviewClassName(idx, data.type)
            )
          : '';

      const blockData = {
        ...data,
        type: option.baseType,
        attributes: {
          ...data.attributes,
          'css-class': classnames(
            data.attributes['css-class'],
            previewClassName
          ),
        },
      };

      const block = getDefaultEngine().registry.blocks.getBlockByType(blockData.type);
      if (!block) {
        throw new Error(`Can not find ${blockData.type}`);
      }

      const children = block?.render({ ...params, data: blockData, idx });

      const parentBlockData = getParentByIdx({ content: context! }, idx!);
      if (!parentBlockData) {
        return children;
      }

      if (
        parentBlockData.type === BasicType.PAGE ||
        parentBlockData.type === BasicType.WRAPPER ||
        parentBlockData.type === AdvancedType.WRAPPER
      ) {
        return (
          <MjmlBlock type={BasicType.SECTION} padding='0px' text-align='left'>
            <MjmlBlock type={BasicType.COLUMN}>{children}</MjmlBlock>
          </MjmlBlock>
        );
      }

      return children;
    },
  });
}
