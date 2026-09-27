import React, { memo, NamedExoticComponent } from 'react';

import { classNames, variationName } from './utils/css';
import { elementChildren, wrapWithComponent } from './utils/components';

import { Item, type ItemProps } from './components/Item';
import styles from './Stack.module.scss';

// From polaris-react

type Spacing = 'extraTight' | 'tight' | 'loose' | 'extraLoose' | 'none';

type Alignment = 'leading' | 'trailing' | 'center' | 'fill' | 'baseline';

type Distribution =
  | 'equalSpacing'
  | 'leading'
  | 'trailing'
  | 'center'
  | 'fill'
  | 'fillEvenly';

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

export const Stack = memo(function Stack({
  children,
  className: classNameProp,
  vertical,
  spacing,
  distribution,
  alignment,
  wrap,
}: StackProps) {
  const rootClassName = classNames(
    styles.Stack,
    vertical && styles.vertical,
    spacing && styles[variationName('spacing', spacing)],
    distribution && styles[variationName('distribution', distribution)],
    alignment && styles[variationName('alignment', alignment)],
    wrap === false && styles.noWrap,
    classNameProp,
  );
  const itemMarkup = elementChildren(children).map((child, index) => {
    const props: ItemProps = { key: index };
    return wrapWithComponent(child, Item, props);
  });

  return (
    <div className={rootClassName}>
      <>{itemMarkup}</>
    </div>
  );
}) as NamedExoticComponent<StackProps> & {
  Item: typeof Item;
};

Stack.Item = Item;

export type { ItemProps };
