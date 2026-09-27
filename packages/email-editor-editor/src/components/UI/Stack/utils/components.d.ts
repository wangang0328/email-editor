import React from 'react';
export declare function wrapWithComponent<P extends any>(element: React.ReactNode | null | undefined, Component: React.FC<P>, props: P): React.ReactNode;
export declare function isElementOfType<P>(element: React.ReactNode | null | undefined, Component: React.ComponentType<P> | React.ComponentType<P>[]): boolean;
export declare function elementChildren<T extends React.ReactElement>(children: React.ReactNode, predicate?: (element: T) => boolean): T[];
interface ConditionalWrapperProps {
    children: any;
    condition: boolean;
    wrapper: (children: any) => any;
}
export declare function ConditionalWrapper({ condition, wrapper, children, }: ConditionalWrapperProps): React.JSX.Element;
interface ConditionalRenderProps {
    condition: boolean;
    children: any;
}
export declare function ConditionalRender({ condition, children, }: ConditionalRenderProps): React.ReactNode;
export {};
//# sourceMappingURL=components.d.ts.map