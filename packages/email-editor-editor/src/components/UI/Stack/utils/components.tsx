import React, { Children, isValidElement } from 'react';

// Wraps `element` in `Component`, if it is not already an instance of
// `Component`. If `props` is passed, those will be added as props on the
// wrapped component. If `element` is null, the component is not wrapped.
export function wrapWithComponent<P extends any>(
  element: React.ReactNode | null | undefined,
  Component: React.FC<P>,
  props: P,
): React.ReactNode {
  if (element == null) {
    return null;
  }

  return isElementOfType(element, Component) ? (
    element
  ) : (
    // React 要求 `key` 必须作为 JSX 属性传入，不能出现在 `{...props}` spread 中。
    // 因此这里显式拆出 key，并从 rest props 中剔除，避免 warning。
    (() => {
      const { key, ...rest } = props as any;
      return (
        <Component key={key} {...rest}>
          {element}
        </Component>
      );
    })()
  );
}

// In development, we compare based on the name of the function because
// React Hot Loader proxies React components in order to make updates. In
// production we can simply compare the components for equality.
const isComponent =
  process.env.NODE_ENV === 'development'
    ? hotReloadComponentCheck
    : (
        AComponent: React.ComponentType<any>,
        AnotherComponent: React.ComponentType<any>,
      ) => AComponent === AnotherComponent;

// Checks whether `element` is a React element of type `Component` (or one of
// the passed components, if `Component` is an array of React components).
export function isElementOfType<P>(
  element: React.ReactNode | null | undefined,
  Component: React.ComponentType<P> | React.ComponentType<P>[],
): boolean {
  if (element == null || !isValidElement(element) || typeof element.type === 'string') {
    return false;
  }

  const { type: defaultType } = element;
  // Type override allows components to bypass default wrapping behavior. Ex: Stack, ResourceList...
  // See https://github.com/Shopify/app-extension-libs/issues/996#issuecomment-710437088
  const overrideType = (element.props as { __type__?: unknown } | undefined)?.__type__;
  const type = (overrideType || defaultType) as React.ElementType;
  const Components = Array.isArray(Component) ? Component : [Component];

  return Components.some(
    AComponent =>
      typeof type !== 'string' &&
      isComponent(AComponent, type as React.ComponentType<any>),
  );
}

// Returns all children that are valid elements as an array. Can optionally be
// filtered by passing `predicate`.
export function elementChildren<T extends React.ReactElement>(
  children: React.ReactNode,
  predicate: (element: T) => boolean = () => true,
): T[] {
  return Children.toArray(children).filter(
    child => isValidElement(child) && predicate(child as T),
  ) as T[];
}

interface ConditionalWrapperProps {
  children: any;
  condition: boolean;
  wrapper: (children: any) => any;
}

export function ConditionalWrapper({
  condition,
  wrapper,
  children,
}: ConditionalWrapperProps): React.JSX.Element {
  return condition ? wrapper(children) : children;
}

interface ConditionalRenderProps {
  condition: boolean;
  children: any;
}

export function ConditionalRender({
  condition,
  children,
}: ConditionalRenderProps): React.ReactNode {
  return condition ? children : null;
}

function hotReloadComponentCheck(
  AComponent: React.ComponentType<any>,
  AnotherComponent: React.ComponentType<any>,
) {
  const componentName = AComponent.name;
  const anotherComponentName = (AnotherComponent as React.FC<any>).displayName;

  return (
    AComponent === AnotherComponent ||
    (Boolean(componentName) && componentName === anotherComponentName)
  );
}
