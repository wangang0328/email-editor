import { IBlockData, BasicType } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from './blockRegistry';

const tempEle = document.createElement('div');
export function getBlockTitle(
  blockData: IBlockData,
  isFromContent = true
): string {
  if (blockData.title) return blockData.title;

  if (
    isFromContent &&
    (blockData.type === BasicType.TEXT || blockData.type === BasicType.BUTTON)
  ) {
    tempEle.innerHTML = blockData.data.value.content;
    return tempEle.innerText;
  }

  const blockName = getBlockByType(blockData.type)?.name || '';
  return blockName;
}
