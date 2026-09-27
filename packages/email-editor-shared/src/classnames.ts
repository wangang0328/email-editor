/** Join non-empty string class tokens (ignores falsey / non-string args). */
export function classnames(...rest: unknown[]): string {
  return rest.filter((item): item is string => typeof item === 'string').join(' ');
}
