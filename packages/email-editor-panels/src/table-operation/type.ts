import type { IAdvancedTableData } from '@wa-dev/email-editor-blocks-react';

export interface IOperationData extends IAdvancedTableData {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IBoundaryRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface IBoundingPosition {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
