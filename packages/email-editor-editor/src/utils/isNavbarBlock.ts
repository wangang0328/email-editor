import { BasicType, AdvancedType } from '@wa-dev/email-editor-core';

export function isNavbarBlock(blockType: any) {
  return blockType === BasicType.NAVBAR || blockType === AdvancedType.NAVBAR;
}