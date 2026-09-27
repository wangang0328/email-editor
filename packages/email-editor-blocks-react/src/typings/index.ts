import type { IPage } from '../plugins/standard/page';
import type { IBlockData, RecursivePartial } from '@wa-dev/email-editor-shared/types';

export type { IBlockData, RecursivePartial };

export interface IBlock<T extends IBlockData = IBlockData> {
  name: string;
  type: string;
  create: (payload?: RecursivePartial<T>) => T;
  validParentType: string[];
  render: (params: {
    data: T;
    idx?: string | null;
    mode: 'testing' | 'production';
    context?: IPage;
    dataSource?: { [key: string]: any };
    children?: React.ReactNode;
    keepClassName?: boolean;
    renderPortal?: (
      props: Omit<Parameters<IBlock<T>['render']>[0], 'renderPortal'> & {
        refEle: HTMLElement;
      }
    ) => React.ReactNode;
  }) => React.ReactNode;
}
