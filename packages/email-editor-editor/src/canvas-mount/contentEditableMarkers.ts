import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import {
  ContentEditableType,
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_EDITABLE_TYPE,
  DATA_CONTENT_FIELD,
  DATA_EE_BLOCK_UID,
} from '@/constants';
import { getContentEditableClassName } from '@/utils/getContentEditableClassName';
import { isButtonBlock } from '@/utils/isButtonBlock';
import { isNavbarBlock } from '@/utils/isNavbarBlock';
import { isTableBlock } from '@/utils/isTableBlock';
import { isTextBlock } from '@/utils/isTextBlock';
import {
  getContentEditableIdxFromClassName,
  getContentEditableTypeFromClassName,
} from '@/utils/contenteditable';

function resolveBlockUid(node: Element): string | null {
  return (
    node.getAttribute(EE_UID_ATTR) ??
    node.closest(`[${EE_UID_ATTR}]`)?.getAttribute(EE_UID_ATTR) ??
    null
  );
}

/** 从完整 form 路径取出相对块根的 field（`data.value...`） */
function contentFieldFromFullPath(fullPath: string): string | null {
  const marker = 'data.value.';
  const at = fullPath.indexOf(marker);
  return at >= 0 ? fullPath.slice(at) : null;
}

function markEditableLeaf(
  editNode: Element,
  opts: {
    editableType: ContentEditableType;
    fullPath: string;
    blockUid: string | null;
    field?: string | null;
  },
): void {
  editNode.setAttribute('contenteditable', 'true');
  editNode.setAttribute(DATA_CONTENT_EDITABLE_TYPE, opts.editableType);
  editNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, opts.fullPath);
  if (!opts.blockUid) {
    return;
  }
  const field = opts.field ?? contentFieldFromFullPath(opts.fullPath);
  if (!field) {
    return;
  }
  editNode.setAttribute(DATA_EE_BLOCK_UID, opts.blockUid);
  editNode.setAttribute(DATA_CONTENT_FIELD, field);
}

/**
 * 为块根节点添加 contenteditable 定位 class（供子节点查找 type / idx）。
 * 逻辑与 HtmlStringToReactNodes.makeStandardContentEditable 一致。
 */
export function markStandardContentEditable(
  node: HTMLElement,
  blockType: string,
  idx: string,
): void {
  if (isTextBlock(blockType) || isButtonBlock(blockType) || isTableBlock(blockType)) {
    node.classList.add(
      ...getContentEditableClassName(blockType, `${idx}.data.value.content`),
    );
  }
  if (isNavbarBlock(blockType)) {
    node.querySelectorAll('.mj-link').forEach((anchor, index) => {
      anchor.classList.add(
        ...getContentEditableClassName(
          blockType,
          `${idx}.data.value.links.${index}.content`,
        ),
      );
    });
  }
}

/**
 * 在块子树内为可编辑叶子注入 contenteditable 与 data 属性。
 * Text / Button / Navbar / Table 各有不同 DOM 结构，此处按块类型分别处理。
 */
export function markBlockContentEditable(node: ChildNode): void {
  if (!(node instanceof Element)) {
    return;
  }

  const type = getContentEditableTypeFromClassName(node.classList);
  const idx = getContentEditableIdxFromClassName(node.classList);

  if (isTextBlock(type)) {
    const editNode = node.querySelector('div');
    const blockUid = resolveBlockUid(node);
    if (editNode) {
      markEditableLeaf(editNode, {
        editableType: ContentEditableType.RichText,
        fullPath: idx,
        blockUid,
        field: 'data.value.content',
      });
    }
  } else if (isButtonBlock(type)) {
    const editNode = node.querySelector('a') || node.querySelector('p');
    const blockUid = resolveBlockUid(node);
    if (editNode) {
      markEditableLeaf(editNode, {
        editableType: ContentEditableType.Text,
        fullPath: idx,
        blockUid,
        field: 'data.value.content',
      });
    }
  } else if (isNavbarBlock(type)) {
    // `.mj-link` 上挂 contenteditable class；uid 取最近块根
    markEditableLeaf(node, {
      editableType: ContentEditableType.Text,
      fullPath: idx,
      blockUid: resolveBlockUid(node),
    });
  } else if (isTableBlock(type)) {
    const blockUid = resolveBlockUid(node);
    const trNodes = node.querySelectorAll('tr');
    trNodes.forEach((trNode, trIndex) => {
      const cellNodes = trNode.querySelectorAll('td, th');
      cellNodes.forEach((cellNode, tdIndex) => {
        const field = `data.value.tableSource.${trIndex}.${tdIndex}.content`;
        const cellIdx = idx.replace('data.value.content', field);
        markEditableLeaf(cellNode, {
          editableType: ContentEditableType.RichText,
          fullPath: cellIdx,
          blockUid,
          field,
        });
      });
    });
  }

  node.childNodes.forEach(markBlockContentEditable);
}
