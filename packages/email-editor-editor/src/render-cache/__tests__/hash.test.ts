import { hashBlockSubtree, hashString, stableStringify } from '../hash';

describe('render-cache/hash', () => {
  it('stableStringify 不受 key 顺序影响', () => {
    const a = stableStringify({ z: 1, a: 2 });
    const b = stableStringify({ a: 2, z: 1 });
    expect(a).toBe(b);
  });

  it('相同子树产生相同 hash', () => {
    const block = {
      type: 'section',
      data: { value: {} },
      attributes: {},
      children: [],
    };
    expect(hashBlockSubtree(block)).toBe(hashBlockSubtree({ ...block }));
  });

  it('不同子树产生不同 hash', () => {
    const blockA = {
      type: 'section',
      data: { value: { x: 1 } },
      attributes: {},
      children: [],
    };
    const blockB = {
      type: 'section',
      data: { value: { x: 2 } },
      attributes: {},
      children: [],
    };
    expect(hashBlockSubtree(blockA)).not.toBe(hashBlockSubtree(blockB));
  });

  it('hashString 对非空字符串有输出', () => {
    expect(hashString('test').length).toBeGreaterThan(0);
  });
});
