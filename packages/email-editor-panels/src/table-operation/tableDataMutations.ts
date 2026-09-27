import type { IAdvancedTableData } from '@wa-dev/email-editor-blocks-react';
import { getMaxTdCount } from './util';

export function appendTableRow(
  tableSource: IAdvancedTableData[][],
  content = '',
): IAdvancedTableData[][] {
  const colCount = Math.max(getMaxTdCount(tableSource), 1);
  const newRow = Array.from({ length: colCount }, () => ({ content }));
  return [...tableSource, newRow];
}

export function removeTableRow(
  tableSource: IAdvancedTableData[][],
): IAdvancedTableData[][] {
  if (tableSource.length <= 1) {
    return tableSource;
  }
  return tableSource.slice(0, -1);
}

export function appendTableColumn(
  tableSource: IAdvancedTableData[][],
  content = '',
): IAdvancedTableData[][] {
  if (tableSource.length === 0) {
    return [[{ content }]];
  }
  return tableSource.map(row => [...row, { content }]);
}

export function removeTableColumn(
  tableSource: IAdvancedTableData[][],
): IAdvancedTableData[][] {
  const colCount = getMaxTdCount(tableSource);
  if (colCount <= 1) {
    return tableSource;
  }
  return tableSource.map(row => (row.length > 0 ? row.slice(0, -1) : row));
}

export function setTableRowCount(
  tableSource: IAdvancedTableData[][],
  targetCount: number,
): IAdvancedTableData[][] {
  const count = Math.max(1, Math.floor(targetCount) || 1);
  let next = tableSource;
  while (next.length < count) {
    next = appendTableRow(next);
  }
  while (next.length > count) {
    next = removeTableRow(next);
  }
  return next;
}

export function setTableColumnCount(
  tableSource: IAdvancedTableData[][],
  targetCount: number,
): IAdvancedTableData[][] {
  const count = Math.max(1, Math.floor(targetCount) || 1);
  let next = tableSource;
  while (getMaxTdCount(next) < count) {
    next = appendTableColumn(next);
  }
  while (getMaxTdCount(next) > count) {
    next = removeTableColumn(next);
  }
  return next;
}

export function getTableRowBackground(
  tableSource: IAdvancedTableData[][],
  rowIndex: number,
): string | undefined {
  const row = tableSource[rowIndex];
  if (!row?.length) {
    return undefined;
  }
  return row.find(cell => cell.backgroundColor)?.backgroundColor;
}

export function setTableRowBackground(
  tableSource: IAdvancedTableData[][],
  rowIndex: number,
  color: string,
): IAdvancedTableData[][] {
  const normalized = color?.trim() ? color : undefined;
  return tableSource.map((row, index) =>
    index === rowIndex
      ? row.map(cell => ({
          ...cell,
          backgroundColor: normalized,
        }))
      : row,
  );
}
