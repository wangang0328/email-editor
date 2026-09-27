import {
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_FIELD,
  DATA_EE_BLOCK_UID,
} from '@/constants';
import { setBlockIndexRegistry } from '@/block-index/blockIndexStore';
import {
  resolveContentEditableFormPath,
  rewritePathWithNewBlockIdx,
} from '../contentEditableFormPath';
import type { BlockIndexRegistry } from '@wa-dev/email-editor-shared';

function createRegistry(
  entries: Array<{ uid: string; idx: string }>,
): BlockIndexRegistry {
  return {
    uidToIdx: (uid: string) => entries.find(e => e.uid === uid)?.idx ?? null,
    idxToUid: (idx: string) => entries.find(e => e.idx === idx)?.uid ?? null,
  } as BlockIndexRegistry;
}

describe('rewritePathWithNewBlockIdx', () => {
  it('keeps data.value suffix', () => {
    expect(
      rewritePathWithNewBlockIdx(
        'content.children.[0].data.value.content',
        'content.children.[2]',
      ),
    ).toBe('content.children.[2].data.value.content');
  });
});

describe('resolveContentEditableFormPath', () => {
  afterEach(() => {
    setBlockIndexRegistry(null);
  });

  it('prefers uid + field over stale contenteditable idx', () => {
    setBlockIndexRegistry(
      createRegistry([{ uid: 'txt-a', idx: 'content.children.[2].children.[0]' }]),
    );

    const el = document.createElement('div');
    el.setAttribute(DATA_EE_BLOCK_UID, 'txt-a');
    el.setAttribute(DATA_CONTENT_FIELD, 'data.value.content');
    // 故意留下 reorder 前的过期路径
    el.setAttribute(
      DATA_CONTENT_EDITABLE_IDX,
      'content.children.[0].children.[0].data.value.content',
    );

    expect(resolveContentEditableFormPath(el)).toBe(
      'content.children.[2].children.[0].data.value.content',
    );
  });

  it('rewrites stale attr when uid present but field missing', () => {
    setBlockIndexRegistry(
      createRegistry([{ uid: 'nav-a', idx: 'content.children.[1]' }]),
    );

    const el = document.createElement('a');
    el.setAttribute(DATA_EE_BLOCK_UID, 'nav-a');
    el.setAttribute(
      DATA_CONTENT_EDITABLE_IDX,
      'content.children.[0].data.value.links.0.content',
    );

    expect(resolveContentEditableFormPath(el)).toBe(
      'content.children.[1].data.value.links.0.content',
    );
  });

  it('does not trust stale idx when uid is known but registry miss', () => {
    setBlockIndexRegistry(createRegistry([]));

    const el = document.createElement('div');
    el.setAttribute(DATA_EE_BLOCK_UID, 'missing');
    el.setAttribute(
      DATA_CONTENT_EDITABLE_IDX,
      'content.children.[0].data.value.content',
    );

    expect(resolveContentEditableFormPath(el)).toBeNull();
  });
});
