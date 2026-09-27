import { BasicType, AdvancedType } from '@wa-dev/email-editor-blocks-react';

export function isButtonBlock(blockType: any) {
  return blockType === BasicType.BUTTON || blockType === AdvancedType.BUTTON;
}