import { BasicType, getNodeIdxClassName } from '@wa-dev/email-editor-blocks-react';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { ensureBlockStableId } from '@wa-dev/email-editor-shared';
import {
  buildMountPlan,
  buildSegmentMountSnapshot,
} from '../buildMountPlan';
import { postProcessEmailHtml } from '../postProcessEmailHtml';

function makeSectionHtml(idx: string, bg: string): string {
  const idxClass = getNodeIdxClassName(idx);
  const typeClass = `node-type-${BasicType.SECTION}`;
  return `<div class="email-block ${typeClass} ${idxClass}" style="background:${bg}"><div>Section</div></div>`;
}

function makePage(sections: IBlockData[]): IBlockData {
  return {
    type: BasicType.PAGE,
    data: { value: {} },
    attributes: {},
    children: sections,
  };
}

function makeSection(bg: string): IBlockData {
  const section: IBlockData = {
    type: BasicType.SECTION,
    data: { value: { backgroundColor: bg } },
    attributes: {},
    children: [],
  };
  ensureBlockStableId(section);
  return section;
}

describe('canvas-mount/postProcessEmailHtml', () => {
  it('为链接设置 tabindex=-1', () => {
    const raw = '<!DOCTYPE html><html><head></head><body><a href="#">link</a></body></html>';
    const { mountHtml } = postProcessEmailHtml(raw, { enabledMergeTagsBadge: false });
    expect(mountHtml).toContain('tabindex="-1"');
  });

  it('为块根节点注入 data-selector', () => {
    const idx = 'content.children.[0]';
    const raw = `<!DOCTYPE html><html><head></head><body>${makeSectionHtml(idx, 'red')}</body></html>`;
    const { mountHtml } = postProcessEmailHtml(raw, { enabledMergeTagsBadge: false });
    expect(mountHtml).toContain('data-selector=');
  });

  it('注入 data-ee-uid（当提供 pageData）', () => {
    const section = makeSection('red');
    const page = makePage([section]);
    const uid = section.data.value.eeUid as string;
    const idx = 'content.children.[0]';
    const raw = `<!DOCTYPE html><html><head></head><body>${makeSectionHtml(idx, 'red')}</body></html>`;
    const { mountHtml } = postProcessEmailHtml(raw, { enabledMergeTagsBadge: false }, page);
    expect(mountHtml).toContain(`data-ee-uid="${uid}"`);
  });
});

describe('canvas-mount/buildMountPlan', () => {
  it('段 hash 均未变时返回 noop', () => {
    const page = makePage([makeSection('red'), makeSection('blue')]);
    const raw = `<!DOCTYPE html><html><head></head><body>${makeSectionHtml('content.children.[0]', 'red')}${makeSectionHtml('content.children.[1]', 'blue')}</body></html>`;
    const { mountHtml } = postProcessEmailHtml(raw, { enabledMergeTagsBadge: false }, page);

    const container = document.createElement('div');
    container.innerHTML = mountHtml;

    const plan = buildMountPlan({
      pageData: page,
      container,
      prevSnapshot: buildSegmentMountSnapshot(page),
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('noop');
  });

  it('仅 segment 顺序变化时返回 splice', () => {
    const sectionA = makeSection('red');
    const sectionB = makeSection('blue');
    const page = makePage([sectionA, sectionB]);

    const raw = `<!DOCTYPE html><html><head></head><body>${makeSectionHtml('content.children.[0]', 'red')}${makeSectionHtml('content.children.[1]', 'blue')}</body></html>`;
    const { mountHtml } = postProcessEmailHtml(raw, { enabledMergeTagsBadge: false }, page);

    const container = document.createElement('div');
    container.innerHTML = mountHtml;

    const swappedPage = makePage([sectionB, sectionA]);

    const plan = buildMountPlan({
      pageData: swappedPage,
      container,
      prevSnapshot: buildSegmentMountSnapshot(swappedPage),
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('splice');
    expect(plan.spliceStableIds).toEqual([
      sectionB.data.value.eeUid,
      sectionA.data.value.eeUid,
    ]);
  });
});
