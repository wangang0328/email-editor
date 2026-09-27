import { isString } from 'lodash-es';

const BORDER_WIDTH_RE = /^\d+(\.\d+)?(px|%)$/;

export const borderWidthAdapter = {
  format(val: string) {
    if (!isString(val) && !val) return '';
    return val.toString().trim();
  },
  parse(val: string) {
    if (!isString(val)) return undefined;
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    if (BORDER_WIDTH_RE.test(trimmed)) return trimmed;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  },
};
