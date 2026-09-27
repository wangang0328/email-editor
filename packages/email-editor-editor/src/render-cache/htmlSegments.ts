import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import {
  getChildIdx,
  getNodeIdxClassName,
  getPageIdx,
  getValueByIdx,
} from '@wa-dev/email-editor-shared';
import { cloneDeep } from 'lodash-es';

const domParser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;

/**
 * 从 currentIdx 沿树向下走向 targetIdx 时，下一层应走的 child 下标。
 * 例：current=`content`，target=`content.children.[2].children.[1]` → 返回 2。
 */
function getBranchChildIndex(currentIdx: string, targetIdx: string): number {
  if (currentIdx === targetIdx) {
    return -1;
  }
  const suffix = targetIdx.slice(currentIdx.length);
  const match = /^\.children\.\[(\d+)\]/.exec(suffix);
  return match ? Number(match[1]) : -1;
}

/**
 * 路径外 sibling 的占位块：仅保留类型与数组下标，无子节点。
 * JsonToMjml 会为 stub 生成带正确 node-idx 的空壳，使目标 segment 的 idx 与整页 baseline 对齐。
 */
function createMinimalStub(source: IBlockData): IBlockData {
  return {
    type: source.type,
    data: { value: {} },
    attributes: {},
    children: [],
  };
}

/**
 * 原地裁剪 page 树：只保留通向 targetIdx 的分支，且每一层 child 下标与原始树一致。
 *
 * 错误做法（已修复）：把 segment 折叠为 `page.children[0]`，编译出 `node-idx-content.children.[0]`，
 * 而 baseline 中为 `content.children.[n]`（n>0）→ extractSegmentOuterHtml / replaceSegmentInHtml 失败 → L2 降级全量 miss。
 */
function trimPageToSegmentPath(
  block: IBlockData,
  currentIdx: string,
  targetIdx: string,
): void {
  if (currentIdx === targetIdx) {
    return;
  }

  const branchIndex = getBranchChildIndex(currentIdx, targetIdx);
  if (branchIndex < 0 || !block.children?.[branchIndex]) {
    return;
  }

  const kept: IBlockData[] = [];
  for (let i = 0; i <= branchIndex; i += 1) {
    const child = block.children[i];
    if (i === branchIndex) {
      const childClone = cloneDeep(child);
      kept.push(childClone);
      trimPageToSegmentPath(childClone, getChildIdx(currentIdx, i), targetIdx);
    } else {
      kept.push(createMinimalStub(child));
    }
  }
  block.children = kept;
}

/**
 * 在 HTML 文档中按 node-idx class 查找块根节点。
 * idx 含 `.` `[]` 等字符，使用 classList 精确匹配而非 CSS 选择器转义。
 */
export function findElementByNodeIdx(doc: Document, segmentIdx: string): Element | null {
  const targetClass = getNodeIdxClassName(segmentIdx);
  const candidates = doc.querySelectorAll('[class*="node-idx-"]');
  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i];
    if (el.classList.contains(targetClass)) {
      return el;
    }
  }
  return null;
}

/**
 * 从整页编译 HTML 中提取某渲染段的外层 HTML 字符串。
 */
export function extractSegmentOuterHtml(fullHtml: string, segmentIdx: string): string | null {
  if (!domParser || !fullHtml) {
    return null;
  }
  const doc = domParser.parseFromString(fullHtml, 'text/html');
  const el = findElementByNodeIdx(doc, segmentIdx);
  if (!el) {
    return null;
  }
  return el.outerHTML;
}

/**
 * 将段 HTML 替换进基线整页 HTML。
 * 找不到目标节点时返回 null，由上层降级全量编译。
 */
export function replaceSegmentInHtml(
  baseHtml: string,
  segmentIdx: string,
  segmentHtml: string,
): string | null {
  if (!domParser) {
    return null;
  }

  const baseDoc = domParser.parseFromString(baseHtml, 'text/html');
  const target = findElementByNodeIdx(baseDoc, segmentIdx);
  if (!target) {
    return null;
  }

  const fragmentDoc = domParser.parseFromString(
    `<!DOCTYPE html><html><body>${segmentHtml}</body></html>`,
    'text/html',
  );
  const source =
    findElementByNodeIdx(fragmentDoc, segmentIdx) ?? fragmentDoc.body.firstElementChild;
  if (!source) {
    return null;
  }

  target.replaceWith(source.cloneNode(true));
  return `<!DOCTYPE html>${baseDoc.documentElement.outerHTML}`;
}

/**
 * 为 L2 单段重编译构造最小 page 树。
 *
 * - 保留 page 级属性（breakpoint、headStyles 等），保证 MJML 输出与整页一致
 * - 通过 trimPageToSegmentPath 保留 segment 原始 idx，供 testing 模式 node-idx class 对齐 baseline
 *
 * @see segmentAssembly.ts assembleFromSegmentCache
 * @see 三级缓存说明.md §4.2
 */
export function rebuildPageForSegment(pageData: IBlockData, segmentIdx: string): IBlockData | null {
  const segment = getValueByIdx({ content: pageData }, segmentIdx) as IBlockData | undefined;
  if (!segment) {
    return null;
  }

  const page = cloneDeep(pageData);
  trimPageToSegmentPath(page, getPageIdx(), segmentIdx);
  return page;
}

/** 将 page 的 breakpoint 字段覆写（预览 Tab 专用） */
export function applyBreakpointOverride(
  pageData: IBlockData,
  breakpointOverride?: string,
): IBlockData {
  if (!breakpointOverride) {
    return pageData;
  }
  return {
    ...pageData,
    data: {
      ...pageData.data,
      value: {
        ...pageData.data.value,
        breakpoint: breakpointOverride,
      },
    },
  };
}
