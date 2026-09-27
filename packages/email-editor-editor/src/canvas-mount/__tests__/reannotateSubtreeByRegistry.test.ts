import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import {
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_FIELD,
  DATA_EE_BLOCK_UID,
} from '@/constants';
import { setBlockIndexRegistry } from '@/block-index/blockIndexStore';
import { resolveContentEditableFormPath } from '@/utils/contentEditableFormPath';
import {
  reannotateSubtreeByRegistry,
  rewritePathWithNewBlockIdx,
} from '../reannotateSubtreeByRegistry';
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

  it('rewrites table cell paths', () => {
    expect(
      rewritePathWithNewBlockIdx(
        'content.children.[1].data.value.tableSource.0.1.content',
        'content.children.[0]',
      ),
    ).toBe('content.children.[0].data.value.tableSource.0.1.content');
  });
});

describe('reannotateSubtreeByRegistry', () => {
  afterEach(() => {
    setBlockIndexRegistry(null);
  });

  it('rewrites node-idx and contenteditable paths after reorder', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-ee-uid="sec-b" class="email-block node-idx-content.children.[1] node-type-section">
        <div data-ee-uid="txt-b" class="email-block node-idx-content.children.[1].children.[0] node-type-text node-contenteditable-type-text node-contenteditable-idx-content.children.[1].children.[0].data.value.content">
          <div contenteditable="true" data-content_editable-idx="content.children.[1].children.[0].data.value.content" data-content-field="data.value.content" data-ee-block-uid="txt-b">hello</div>
        </div>
      </div>
      <div data-ee-uid="sec-a" class="email-block node-idx-content.children.[0] node-type-section">
        <div data-ee-uid="txt-a" class="email-block node-idx-content.children.[0].children.[0] node-type-text">
          <div contenteditable="true" data-content_editable-idx="content.children.[0].children.[0].data.value.content" data-content-field="data.value.content" data-ee-block-uid="txt-a">world</div>
        </div>
      </div>
    `;

    const registry = createRegistry([
      { uid: 'sec-b', idx: 'content.children.[0]' },
      { uid: 'txt-b', idx: 'content.children.[0].children.[0]' },
      { uid: 'sec-a', idx: 'content.children.[1]' },
      { uid: 'txt-a', idx: 'content.children.[1].children.[0]' },
    ]);

    const updated = reannotateSubtreeByRegistry(root, registry);
    expect(updated).toBe(4);

    const secB = root.querySelector(`[${EE_UID_ATTR}="sec-b"]`) as HTMLElement;
    const txtB = root.querySelector(`[${EE_UID_ATTR}="txt-b"]`) as HTMLElement;
    const editB = txtB.querySelector('[contenteditable="true"]') as HTMLElement;

    expect(secB.className).toContain('node-idx-content.children.[0]');
    expect(secB.className).not.toContain('node-idx-content.children.[1]');
    expect(txtB.className).toContain('node-idx-content.children.[0].children.[0]');
    expect(txtB.className).toContain(
      'node-contenteditable-idx-content.children.[0].children.[0].data.value.content',
    );
    expect(editB.getAttribute('data-content_editable-idx')).toBe(
      'content.children.[0].children.[0].data.value.content',
    );
  });

  it('after reorder, form path from contenteditable follows new idx (move text fix)', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-ee-uid="sec-b" class="email-block node-idx-content.children.[1]">
        <div data-ee-uid="txt-b" class="email-block node-idx-content.children.[1].children.[0]">
          <div contenteditable="true"
            ${DATA_CONTENT_EDITABLE_IDX}="content.children.[1].children.[0].data.value.content"
            ${DATA_CONTENT_FIELD}="data.value.content"
            ${DATA_EE_BLOCK_UID}="txt-b">hello</div>
        </div>
      </div>
    `;

    const registry = createRegistry([
      { uid: 'sec-b', idx: 'content.children.[0]' },
      { uid: 'txt-b', idx: 'content.children.[0].children.[0]' },
    ]);
    setBlockIndexRegistry(registry);

    // 模拟 reorder 后 DOM 物理顺序已变，但 attr 仍过期 → 先靠 uid 写对路径
    const editBefore = root.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(resolveContentEditableFormPath(editBefore)).toBe(
      'content.children.[0].children.[0].data.value.content',
    );

    reannotateSubtreeByRegistry(root, registry);

    const editAfter = root.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(editAfter.getAttribute(DATA_CONTENT_EDITABLE_IDX)).toBe(
      'content.children.[0].children.[0].data.value.content',
    );
    expect(resolveContentEditableFormPath(editAfter)).toBe(
      'content.children.[0].children.[0].data.value.content',
    );
  });
});
