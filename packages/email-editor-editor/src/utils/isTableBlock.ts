import { BasicType, AdvancedType } from '@wa-dev/email-editor-blocks-react';

export function isTableBlock(blockType: any) {
  return blockType === AdvancedType.TABLE;
}
