import { removeSegmentDom, spliceSegmentDom } from '../surgicalSegmentDom';
import { reorderSegmentDom } from '../reorderSegmentDom';

function makeSection(id: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-ee-uid', id);
  el.className = 'email-block node-type-section';
  el.textContent = id;
  return el;
}

describe('surgicalSegmentDom', () => {
  function mount(...ids: string[]): { container: HTMLElement; parent: HTMLElement } {
    const container = document.createElement('div');
    const parent = document.createElement('div');
    ids.forEach((id) => parent.appendChild(makeSection(id)));
    container.appendChild(parent);
    return { container, parent };
  }

  function domOrder(parent: HTMLElement): string[] {
    return Array.from(parent.children).map(
      (el) => el.getAttribute('data-ee-uid') ?? '',
    );
  }

  it('removeSegmentDom deletes by uid', () => {
    const { container, parent } = mount('a', 'b', 'c');
    const { ok, removed } = removeSegmentDom(container, ['b']);
    expect(ok).toBe(true);
    expect(removed).toBe(1);
    expect(domOrder(parent)).toEqual(['a', 'c']);
  });

  it('spliceSegmentDom remove + reorder for 同父删段后对齐', () => {
    const { container, parent } = mount('a', 'b', 'c', 'd');
    expect(spliceSegmentDom(container, ['a', 'c', 'd'], ['b'])).toBe(true);
    expect(domOrder(parent)).toEqual(['a', 'c', 'd']);
  });

  it('spliceSegmentDom without remove equals reorder (同父移段)', () => {
    const { container, parent } = mount('a', 'b', 'c');
    expect(spliceSegmentDom(container, ['b', 'c', 'a'], [])).toBe(true);
    expect(domOrder(parent)).toEqual(['b', 'c', 'a']);
    expect(reorderSegmentDom(container, ['b', 'c', 'a'])).toBe(true);
  });

  it('remove missing uid returns ok=false', () => {
    const { container } = mount('a', 'b');
    const { ok, removed } = removeSegmentDom(container, ['missing']);
    expect(ok).toBe(false);
    expect(removed).toBe(0);
  });
});
