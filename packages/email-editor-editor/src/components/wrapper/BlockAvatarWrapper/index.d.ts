import React from 'react';
import type { BlockType } from '@wa-dev/email-editor-blocks-react';
export type BlockAvatarWrapperProps = {
    children?: React.ReactNode;
    type: BlockType | string;
    /** 新建块时的初始数据（如布局块预置的 SECTION + COLUMN 结构） */
    payload?: any;
    /** add：从左侧面板拖入新块；move：画布内移动已有块 */
    action?: 'add' | 'move';
    hideIcon?: boolean;
    /** move 模式下被移动块在 JSON 树中的 idx 路径 */
    idx?: string;
};
/**
 * 统一拖拽封装：左侧面板块列表、快捷工具栏、画布 FocusTooltip 移动手柄都通过此组件发起拖放。
 *
 * 协作方：
 * - dragStart：写入 HoverIdxProvider.dataTransfer（块类型 / 来源 idx）
 * - dragover：useDropBlock（画布）实时更新 dataTransfer.parentIdx / positionIndex
 * - dragEnd：读取插入位置，调用 useBlock.addBlock 或 moveBlock 写回表单
 */
export declare const BlockAvatarWrapper: React.FC<BlockAvatarWrapperProps>;
//# sourceMappingURL=index.d.ts.map