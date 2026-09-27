import { set } from 'lodash-es';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { createBlockStableId, EE_UID_DATA_PATH } from '@wa-dev/email-editor-shared';

/** 复制块时为整棵子树分配新 eeUid，避免 DOM morph 键冲突 */
export function regenerateBlockStableIds(block: IBlockData): void {
  set(block, EE_UID_DATA_PATH, createBlockStableId());
  block.children?.forEach(regenerateBlockStableIds);
}
