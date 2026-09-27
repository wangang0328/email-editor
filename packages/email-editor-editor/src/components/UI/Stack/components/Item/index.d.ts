import React from 'react';
export interface ItemProps {
    /** Elements to display inside item */
    children?: React.ReactNode | any;
    /** Fill the remaining horizontal space in the stack with the item  */
    fill?: boolean;
    /**
     * @default false
     */
    key?: string | number;
    /** Appended to the item root (e.g. Tailwind utilities) */
    className?: string;
}
export declare function Item({ children, fill, className }: ItemProps): React.JSX.Element;
//# sourceMappingURL=index.d.ts.map