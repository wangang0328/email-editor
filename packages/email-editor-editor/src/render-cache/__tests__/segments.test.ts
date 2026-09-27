import { BasicType } from '@wa-dev/email-editor-shared';
import { collectRenderSegments } from '../segments';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';

function makeSection(id: string): IBlockData {
  return {
    type: BasicType.SECTION,
    data: { value: { tag: id } },
    attributes: {},
    children: [],
  };
}

function makePage(sections: IBlockData[]): IBlockData {
  return {
    type: BasicType.PAGE,
    data: { value: {} },
    attributes: {},
    children: sections,
  };
}

describe('render-cache/segments', () => {
  it('collectRenderSegments 收集 page 下直接 section', () => {
    const page = makePage([makeSection('a'), makeSection('b')]);
    const segments = collectRenderSegments(page);
    expect(segments).toHaveLength(2);
    expect(segments[0].idx).toBe('content.children.[0]');
    expect(segments[1].idx).toBe('content.children.[1]');
  });
});
