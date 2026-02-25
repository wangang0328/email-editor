import { BasicType, AdvancedType } from '@wa-dev/email-editor-core';

export function isButtonBlock(blockType: any) {
  return blockType === BasicType.BUTTON || blockType === AdvancedType.BUTTON;
}