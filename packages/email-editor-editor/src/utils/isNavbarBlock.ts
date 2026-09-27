import { BasicType, AdvancedType } from '@wa-dev/email-editor-blocks-react';

export function isNavbarBlock(blockType: any) {
  return blockType === BasicType.NAVBAR || blockType === AdvancedType.NAVBAR;
}