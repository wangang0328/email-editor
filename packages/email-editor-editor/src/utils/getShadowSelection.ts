import { getShadowRoot } from './getShadowRoot';

/** Shadow DOM 内选区（contenteditable / execCommand 使用） */
export function getShadowSelection(): Selection | null {
  const shadow = getShadowRoot();
  if (!shadow) {
    return null;
  }
  return (shadow as unknown as { getSelection?: () => Selection }).getSelection?.() ?? null;
}
