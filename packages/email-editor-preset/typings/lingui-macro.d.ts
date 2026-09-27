declare module '@lingui/core/macro' {
  export function t(key: string): string;
  export function t(
    literals: TemplateStringsArray,
    ...placeholders: unknown[]
  ): string;
  export const plural: (...args: unknown[]) => string;
  export const select: (...args: unknown[]) => string;
  export const selectOrdinal: (...args: unknown[]) => string;
  export const defineMessage: (...args: unknown[]) => { id: string; message?: string };
}
