export {};

declare module '@wa-dev/email-editor-blocks-react' {
  export function getParentIdx(idx: string): string | null;
  export function getPageIdx(): string;
  export function getParentByIdx(values: { content: unknown }, idx: string): { type?: string } | null;
}
