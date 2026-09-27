import { reorderSegmentDom } from '../reorderSegmentDom';

function makeSection(id: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-ee-uid', id);
  el.className = 'email-block node-type-section';
  el.textContent = id;
  return el;
}

describe('canvas-mount/reorderSegmentDom', () => {
  function mount(...ids: string[]): { container: HTMLElement; parent: HTMLElement } {
    const container = document.createElement('div');
    const parent = document.createElement('div');
    ids.forEach((id) => parent.appendChild(makeSection(id)));
    container.appendChild(parent);
    return { container, parent };
  }

  function domOrder(parent: HTMLElement): string[] {
    return Array.from(parent.children).map((el) => el.getAttribute('data-ee-uid') ?? '');
  }

  it('将首段移到第三段前（4 段）', () => {
    const { container } = mount('a', 'b', 'c', 'd');
    expect(reorderSegmentDom(container, ['b', 'c', 'a', 'd'])).toBe(true);
    expect(domOrder(container.firstElementChild!)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('将首段移到第二段后（3 段）', () => {
    const { container } = mount('a', 'b', 'c');
    expect(reorderSegmentDom(container, ['b', 'a', 'c'])).toBe(true);
    expect(domOrder(container.firstElementChild!)).toEqual(['b', 'a', 'c']);
  });

  it('将首段移到末尾', () => {
    const { container } = mount('a', 'b', 'c');
    expect(reorderSegmentDom(container, ['b', 'c', 'a'])).toBe(true);
    expect(domOrder(container.firstElementChild!)).toEqual(['b', 'c', 'a']);
  });
});
