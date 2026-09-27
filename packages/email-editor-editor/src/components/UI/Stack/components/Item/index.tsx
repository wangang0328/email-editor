import React from 'react';

import { classNames } from '../../utils/css';
import styles from '../../Stack.module.scss';

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

export function Item({ children, fill, className }: ItemProps) {
  const rootClassName = classNames(
    styles.Item,
    fill && styles['Item-fill'],
    className,
  );

  return <div className={rootClassName}>{children}</div>;
}
