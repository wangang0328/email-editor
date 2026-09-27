import { BasicType } from '@wa-dev/email-editor-blocks-react';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import { ensureBlockStableId } from '@wa-dev/email-editor-shared';
import {
  buildMountPlanWithReason,
  buildSegmentMountSnapshot,
} from '../buildMountPlan';

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

function makePage(sections: IBlockData[]): IBlockData {
  return {
    type: BasicType.PAGE,
    data: { value: {} },
    attributes: {},
    children: sections,
  };
}

function mountSections(uids: string[]): HTMLElement {
  const container = document.createElement('div');
  const parent = document.createElement('div');
  uids.forEach((uid) => {
    const el = document.createElement('div');
    el.setAttribute('data-ee-uid', uid);
    el.className = 'email-block node-type-section';
    parent.appendChild(el);
  });
  container.appendChild(parent);
  return container;
}

describe('buildMountPlan remove / splice', () => {
  it('同父移段 → splice（零编译）', () => {
    const a = makeSection('red');
    const b = makeSection('blue');
    const pageBefore = makePage([a, b]);
    const prev = buildSegmentMountSnapshot(pageBefore);
    const pageAfter = makePage([b, a]);
    const container = mountSections([
      a.data.value.eeUid as string,
      b.data.value.eeUid as string,
    ]);

    const { plan, reason } = buildMountPlanWithReason({
      pageData: pageAfter,
      container,
      prevSnapshot: prev,
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('splice');
    expect(plan.spliceStableIds).toEqual([
      b.data.value.eeUid,
      a.data.value.eeUid,
    ]);
    expect(reason).toContain('splice');
  });

  it('同父删段 → remove（零编译）', () => {
    const a = makeSection('red');
    const b = makeSection('blue');
    const c = makeSection('green');
    const pageBefore = makePage([a, b, c]);
    const prev = buildSegmentMountSnapshot(pageBefore);
    const pageAfter = makePage([a, c]);
    const container = mountSections([
      a.data.value.eeUid as string,
      b.data.value.eeUid as string,
      c.data.value.eeUid as string,
    ]);

    const { plan, reason } = buildMountPlanWithReason({
      pageData: pageAfter,
      container,
      prevSnapshot: prev,
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('remove');
    expect(plan.removeStableIds).toEqual([b.data.value.eeUid]);
    expect(plan.spliceStableIds).toEqual([
      a.data.value.eeUid,
      c.data.value.eeUid,
    ]);
    expect(reason).toContain('remove-segments');
  });

  it('删段同时改另一段内容 → morph-full', () => {
    const a = makeSection('red');
    const b = makeSection('blue');
    const pageBefore = makePage([a, b]);
    const prev = buildSegmentMountSnapshot(pageBefore);

    const a2 = makeSection('CHANGED');
    a2.data.value.eeUid = a.data.value.eeUid;
    const pageAfter = makePage([a2]);
    const container = mountSections([
      a.data.value.eeUid as string,
      b.data.value.eeUid as string,
    ]);

    const { plan } = buildMountPlanWithReason({
      pageData: pageAfter,
      container,
      prevSnapshot: prev,
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('morph-full');
  });

  it('新增段 → morph-full', () => {
    const a = makeSection('red');
    const pageBefore = makePage([a]);
    const prev = buildSegmentMountSnapshot(pageBefore);
    const b = makeSection('blue');
    const pageAfter = makePage([a, b]);
    const container = mountSections([a.data.value.eeUid as string]);

    const { plan } = buildMountPlanWithReason({
      pageData: pageAfter,
      container,
      prevSnapshot: prev,
      hasExistingMount: true,
    });

    expect(plan.mode).toBe('morph-full');
  });
});
