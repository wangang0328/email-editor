import React, { useMemo } from 'react';
import { resolveRenderBlock } from './resolveRenderBlock';
import { IBlockData, RecursivePartial } from '@blocks/typings';
import { omit, set } from 'lodash-es';
import { useEmailRenderContext } from '@blocks/render/context';

export type MjmlBlockProps<T extends IBlockData> = {
  idx?: string | null;
  type: T['type'];
  value?: RecursivePartial<T['data']['value']>;
  attributes?: RecursivePartial<T['attributes']>;
  children?: React.ReactNode;
} & RecursivePartial<T['attributes']>;

export default function MjmlBlock<T extends IBlockData>(props: MjmlBlockProps<T>) {
  const { idx, value, type, attributes, children } = props;
  const mergedAttributes = {
    ...omit(props, ['idx', 'type', 'value', 'attributes', 'children', 'data']),
    ...attributes,
  } as RecursivePartial<T['attributes']>;

  const { mode } = useEmailRenderContext();
  const block = resolveRenderBlock(type);

  if (!block) {
    throw new Error(`Can no find ${type}`);
  }

  const mergeValue = useMemo((): undefined | {} => {
    if (typeof children === 'string') {
      if (!value) {
        return {
          content: children,
        };
      } else {
        set(value, 'content', children);
        return value;
      }
    }

    return value;
  }, [children, value]);

  return (
    <>
      {block.render({
        idx: idx,
        mode: mode,
        data: {
          type: block.type,
          data: {
            value: mergeValue,
          },
          attributes: mergedAttributes,
          children: [],
        },
        children,
      })}
    </>
  );
}
