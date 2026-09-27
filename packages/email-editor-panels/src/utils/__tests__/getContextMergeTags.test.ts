import { getChildIdx, getPageIdx } from '@wa-dev/email-editor-shared';
import { getContextMergeTags } from '../getContextMergeTags';

describe('getContextMergeTags', () => {
  it('returns a clone of mergeTags when block has no dataSource', () => {
    const mergeTags = { user: { name: 'Ada' } };
    const pageIdx = getPageIdx();
    const context = {
      [pageIdx]: {
        type: 'page',
        data: { value: {} },
        attributes: {},
        children: [],
      },
    };

    const result = getContextMergeTags(mergeTags, context, pageIdx);

    expect(result).toEqual(mergeTags);
    expect(result).not.toBe(mergeTags);
  });

  it('projects dataSource path onto mergeTags under local key', () => {
    const mergeTags = {
      products: [{ title: 'Sneaker' }, { title: 'Hat' }],
    };
    const pageIdx = getPageIdx();
    const sectionIdx = getChildIdx(pageIdx, 0);
    const context = {
      [pageIdx]: {
        type: 'page',
        data: { value: {} },
        attributes: {},
        children: [
          {
            type: 'section',
            data: {
              value: {
                dataSource: {
                  product: '{{products.0}}',
                },
              },
            },
            attributes: {},
            children: [],
          },
        ],
      },
    };

    const result = getContextMergeTags(mergeTags, context, sectionIdx);

    expect(result.product).toEqual({ title: 'Sneaker' });
    expect(result.products).toEqual(mergeTags.products);
  });
});
