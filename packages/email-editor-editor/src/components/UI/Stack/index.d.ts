import React, { NamedExoticComponent } from 'react';
import { Item, type ItemProps } from './components/Item';
type Spacing = 'extraTight' | 'tight' | 'loose' | 'extraLoose' | 'none';
type Alignment = 'leading' | 'trailing' | 'center' | 'fill' | 'baseline';
type Distribution = 'equalSpacing' | 'leading' | 'trailing' | 'center' | 'fill' | 'fillEvenly';
export interface StackProps {
    /** Elements to display inside stack */
    children?: React.ReactNode;
    /** Appended to the stack root (e.g. Tailwind `w-full`) */
    className?: string;
    /** Wrap stack elements to additional rows as needed on small screens (Defaults to true) */
    wrap?: boolean;
    /** Stack the elements vertically */
    vertical?: boolean;
    /** Adjust spacing between elements */
    spacing?: Spacing;
    /** Adjust vertical alignment of elements */
    alignment?: Alignment;
    /** Adjust horizontal alignment of elements */
    distribution?: Distribution;
}
export declare const Stack: NamedExoticComponent<StackProps> & {
    Item: typeof Item;
};
export type { ItemProps };
//# sourceMappingURL=index.d.ts.map