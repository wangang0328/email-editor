import React from 'react';
import './index.scss';
export interface ButtonProps {
    children?: React.ReactNode;
    disabled?: boolean;
    title?: string;
    noBorder?: boolean;
    onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
}
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=index.d.ts.map