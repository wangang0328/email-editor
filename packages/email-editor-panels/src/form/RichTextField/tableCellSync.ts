import { getBlockNodeByIdx } from '@wa-dev/email-editor-editor';
import { blockIdxFromContentFieldPath } from '@wa-dev/email-editor-editor';

export function isTableCellFieldPath(fieldPath: string): boolean {
  return fieldPath.includes('tableSource');
}

/** 将画布表格 DOM 中所有单元格内容写回 form，避免只更新一格时重绘覆盖其它列 */
export function syncTableCellsFromDom(
  fieldPath: string,
  change: (path: string, value: string) => void,
): void {
  const blockIdx = blockIdxFromContentFieldPath(fieldPath);
  const blockNode = getBlockNodeByIdx(blockIdx);
  if (!blockNode) {
    return;
  }

  blockNode.querySelectorAll('tr').forEach((tr, trIndex) => {
    tr.querySelectorAll('td, th').forEach((cell, tdIndex) => {
      if (cell.getAttribute('contenteditable') !== 'true') {
        return;
      }
      change(
        `${blockIdx}.data.value.tableSource.${trIndex}.${tdIndex}.content`,
        cell.innerHTML || '',
      );
    });
  });
}
