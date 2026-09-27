import { BasicType } from '@wa-dev/email-editor-shared';
import { IBlock, IBlockData } from '@blocks/typings';
import { createCustomBlock } from '@blocks/utils/createCustomBlock';
import { TemplateEngineManager } from '@blocks/utils/TemplateEngineManager';
import { merge } from 'lodash-es';
import React from 'react';
import type { IPage } from '@blocks/plugins/standard/page';
import { getDefaultEngine, type BlockRegistryEntry } from '@wa-dev/email-editor-engine';

export function generateAdvancedBlock<T extends AdvancedBlock>(option: {
  type: string;
  baseType: BasicType;
  getContent: (params: {
    index: number;
    data: T;
    idx: string | null | undefined;
    mode: 'testing' | 'production';
    context?: IPage;
    dataSource?: { [key: string]: any };
  }) => ReturnType<NonNullable<IBlock['render']>>;
  validParentType: string[];
}) {
  const resolveBaseBlock = (): BlockRegistryEntry<IBlockData> => {
    const baseBlock = getDefaultEngine().registry.blocks.getBlockByType<IBlockData>(
      option.baseType,
    );
    if (!baseBlock) {
      throw new Error(`Can not find ${option.baseType}`);
    }
    return baseBlock;
  };

  return createCustomBlock<T>({
    get name() {
      return resolveBaseBlock().name;
    },
    type: option.type,
    validParentType: option.validParentType,
    create: payload => {
      const defaultData: T = {
        ...resolveBaseBlock().create(),
        type: option.type,
      } as T;
      return merge(defaultData, payload);
    },
    render: params => {
      const { data, idx, mode, context, dataSource } = params;
      const { iteration, condition } = data.data.value;

      const getBaseContent = (bIdx: string | null | undefined, index: number) =>
        option.getContent({
          index,
          data,
          idx: bIdx,
          mode,
          context,
          dataSource,
        }) as any;

      let children = getBaseContent(idx, 0);

      if (mode === 'testing') {
        return (
          <>
            <React.Fragment key='children'>{children}</React.Fragment>

            {new Array((iteration?.mockQuantity || 1) - 1).fill(true).map((_, index) => (
              <React.Fragment key={index}>
                {getBaseContent(idx, index + 1)}
              </React.Fragment>
            ))}
          </>
        );
      }

      if (condition && condition.enabled) {
        children = TemplateEngineManager.generateTagTemplate('condition')(
          condition,
          children,
        );
      }

      if (iteration && iteration.enabled) {
        children = TemplateEngineManager.generateTagTemplate('iteration')(
          iteration,
          children,
        );
      }

      return children;
    },
  });
}

export interface AdvancedBlock extends IBlockData {
  data: {
    value: {
      condition?: ICondition;
      iteration?: {
        enabled: boolean;
        dataSource: string;
        itemName: string;
        limit: number;
        mockQuantity: number;
      };
    };
  };
}

export interface ICondition {
  groups: Array<IConditionGroup>;
  symbol: OperatorSymbol;
  enabled: boolean;
}

export interface IConditionGroup {
  symbol: OperatorSymbol;
  groups: Array<IConditionGroupItem>;
}

export interface IConditionGroupItem {
  left: string;
  operator: Operator;
  right: string | number;
}

export enum Operator {
  TRUTHY = 'truthy',
  FALSY = 'falsy',
  EQUAL = '==',
  NOT_EQUAL = '!=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  LESS = '<',
  LESS_OR_EQUAL = '<=',
}

export enum OperatorSymbol {
  AND = 'and',
  OR = 'or',
}
