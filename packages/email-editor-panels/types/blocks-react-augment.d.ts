export {};

declare module '@wa-dev/email-editor-blocks-react' {
  export function getParentIdx(idx: string): string | null;

  export interface IAdvancedTableData {
    content: string;
    colSpan?: number;
    rowSpan?: number;
    backgroundColor?: string;
  }

  export type AdvancedTableBlock = import('@wa-dev/email-editor-shared').IBlockData<
    Record<string, unknown>,
    { content?: string; headerRow?: boolean; tableSource: IAdvancedTableData[][] }
  >;
}
