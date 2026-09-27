import type { IBlockData } from '@wa-dev/email-editor-shared/types';

export interface JsonToMjmlOptionProduction {
  idx?: string | null;
  data: IBlockData;
  context?: IBlockData;
  mode: 'production';
  keepClassName?: boolean;
  dataSource?: Record<string, unknown>;
  beautify?: boolean;
}

export interface JsonToMjmlOptionDev {
  data: IBlockData;
  idx: string | null;
  context?: IBlockData;
  dataSource?: Record<string, unknown>;
  mode: 'testing';
  beautify?: boolean;
}

export type JsonToMjmlOption = JsonToMjmlOptionDev | JsonToMjmlOptionProduction;

export function isProductionMode(
  option: JsonToMjmlOption,
): option is JsonToMjmlOptionProduction {
  return option.mode === 'production';
}
