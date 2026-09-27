import { IconFont } from '@wa-dev/email-editor-editor';
import { BasicType } from '@wa-dev/email-editor-blocks-react';
import { Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { IBlockDataWithId } from '../..';

export function EyeIcon({
  blockData,
  hidden,
  onToggleVisible,
}: {
  blockData: IBlockDataWithId;
  hidden?: boolean;
  onToggleVisible: (blockData: IBlockDataWithId, ev: React.MouseEvent) => void;
}) {
  if (hidden)
    return (
      <div style={{ visibility: 'hidden' }}>
        <IconFont icon={Eye} />
      </div>
    );
  if (blockData.type === BasicType.PAGE) return null;

  return blockData.data.hidden ? (
    <IconFont
      icon={EyeOff}
      onClick={(ev) => onToggleVisible(blockData, ev)}
    />
  ) : (
    <IconFont
      icon={Eye}
      onClick={(ev) => onToggleVisible(blockData, ev)}
    />
  );
}
