import type { IPage } from '@wa-dev/email-editor-blocks-react';
export declare function MjmlToJson(data: MjmlBlockItem | string): IPage;
export declare function getMetaDataFromMjml(data?: IChildrenItem): {
    [key: string]: any;
};
