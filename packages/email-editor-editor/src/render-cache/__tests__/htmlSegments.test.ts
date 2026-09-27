import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { getValueByIdx } from '@wa-dev/email-editor-shared';
import { rebuildPageForSegment } from '../htmlSegments';

function makeSection(id: string): IBlockData {
  return {
    type: BasicType.SECTION,
    data: { value: { tag: id } },
    attributes: {},
    children: [],
  };
}

function makePage(children: IBlockData[]): IBlockData {
  return {
    type: BasicType.PAGE,
    data: { value: {} },
    attributes: {},
    children,
  };
}

describe('render-cache/htmlSegments', () => {
  it('rebuildPageForSegment 保留 segment 原始 idx（非折叠到 children.[0]）', () => {
    const page = makePage([makeSection('a'), makeSection('b'), makeSection('c')]);
    const segmentIdx = 'content.children.[1]';

    const minimal = rebuildPageForSegment(page, segmentIdx);
    expect(minimal).not.toBeNull();
    expect(getValueByIdx({ content: minimal! }, segmentIdx)).toBeTruthy();
    expect(minimal!.children).toHaveLength(2);
    expect(minimal!.children?.[1]?.data?.value?.tag).toBe('b');
  });

  it('rebuildPageForSegment 保留 wrapper 内嵌 segment 的 idx 路径', () => {
    const innerSection = makeSection('inner');
    const wrapper: IBlockData = {
      type: BasicType.WRAPPER,
      data: { value: {} },
      attributes: {},
      children: [makeSection('w0'), innerSection, makeSection('w2')],
    };
    const page = makePage([makeSection('top'), wrapper]);
    const segmentIdx = 'content.children.[1].children.[1]';

    const minimal = rebuildPageForSegment(page, segmentIdx);
    expect(minimal).not.toBeNull();
    expect(getValueByIdx({ content: minimal! }, segmentIdx)).toBeTruthy();
    expect(minimal!.children?.[1]?.children).toHaveLength(2);
    expect(minimal!.children?.[1]?.children?.[1]?.data?.value?.tag).toBe('inner');
  });
});
