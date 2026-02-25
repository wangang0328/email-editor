import { BasicType, AdvancedType } from '@wa-dev/email-editor-core';

export function isTableBlock(blockType: any) {
  return blockType === AdvancedType.TABLE;
}
