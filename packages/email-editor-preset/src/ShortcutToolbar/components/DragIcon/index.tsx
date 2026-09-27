import { IconFont, BlockAvatarWrapper } from '@wa-dev/email-editor-editor';
import { Button } from '@wa-dev/email-editor-ui';
import { getBlockTypeIcon } from '@extensions/utils/getBlockTypeIcon';
import React from 'react';
import { IBlockData, RecursivePartial } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '../../../utils/blockRegistry';

export interface DragIconProps<T extends IBlockData> {
  type: string;
  payload?: RecursivePartial<T>;
  color: string;
}

export function DragIcon<T extends IBlockData = any>(props: DragIconProps<T>) {
  const block = getBlockByType(props.type);
  return (
    <BlockAvatarWrapper type={props.type} payload={props.payload}>
      <Button
        type='text'
        title={block?.name}
        className='ee-block-drag-handle'
        icon={(
          <IconFont
            icon={getBlockTypeIcon(props.type)}
            size={16}
            style={{
              color: props.color,
            }}
          />
        )}
      />
    </BlockAvatarWrapper>
  );
}
