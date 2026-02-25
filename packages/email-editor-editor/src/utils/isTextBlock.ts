import { BasicType, AdvancedType } from '@wa-dev/email-editor-core';

export function isTextBlock(blockType: any) {
  return blockType === BasicType.TEXT || blockType === AdvancedType.TEXT;
}