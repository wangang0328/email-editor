/**
 * 将段 outerHTML 转为 DocumentFragment（内存构建，不触发 layout）。
 */
export function htmlToFragment(segmentOuterHtml: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = segmentOuterHtml.trim();
  return template.content;
}
