// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IBlockData<
  Attr extends Record<string, string> = any,
  Data extends { [key: string]: any } = any
> {
  title?: string;
  type: string;
  data: {
    value: Data;
    hidden?: boolean | string;
  };
  attributes: Attr & { 'css-class'?: string };
  children: IBlockData[];
}

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
