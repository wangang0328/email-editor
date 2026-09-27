import { EE_UID_ATTR } from '@wa-dev/email-editor-shared';
import {
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_FIELD,
  DATA_EE_BLOCK_UID,
} from '@/constants';
import { uidToIdx } from '@/block-index/blockIndexStore';
import { getShadowRoot } from './getShadowRoot';

const DATA_VALUE_MARKER = '.data.value.';

/** 保留 `.data.value.*` 后缀，仅替换块 idx 前缀（reorder 后纠正路径） */
export function rewritePathWithNewBlockIdx(
  oldPath: string,
  newIdx: string,
): string {
  if (!oldPath) {
    return newIdx;
  }
  const markerAt = oldPath.indexOf(DATA_VALUE_MARKER);
  if (markerAt >= 0) {
    return `${newIdx}${oldPath.slice(markerAt)}`;
  }
  return newIdx;
}

/**
 * 从 contenteditable 元素解析 form 字段路径。
 * 优先 data-ee-block-uid + data-content-field（move 后仍正确）；
 * 有 uid 时绝不盲信可能过期的 data-content_editable-idx 前缀。
 */
export function resolveContentEditableFormPath(active: Element): string | null {
  const blockUid =
    active.getAttribute(DATA_EE_BLOCK_UID) ??
    active.closest(`[${EE_UID_ATTR}]`)?.getAttribute(EE_UID_ATTR);

  const field = active.getAttribute(DATA_CONTENT_FIELD);
  if (blockUid && field) {
    const idx = uidToIdx(blockUid);
    if (idx) {
      return `${idx}.${field}`;
    }
  }

  // uid 已知但缺 field：用 registry 纠正过期 attr，而不是整段信旧 idx
  if (blockUid) {
    const idx = uidToIdx(blockUid);
    const stalePath = active.getAttribute(DATA_CONTENT_EDITABLE_IDX);
    if (idx && stalePath) {
      return rewritePathWithNewBlockIdx(stalePath, idx);
    }
    return null;
  }

  // 无 uid（异常/未注入）：仅此场景回退 attr
  return active.getAttribute(DATA_CONTENT_EDITABLE_IDX);
}

/** form 字段路径 → 块 idx */
export function blockIdxFromContentFieldPath(fieldPath: string): string {
  const marker = '.data.value.';
  const i = fieldPath.indexOf(marker);
  return i >= 0 ? fieldPath.slice(0, i) : fieldPath;
}

/** 复制/删除等结构操作：优先从当前 contenteditable 解析块 idx */
export function resolveBlockIdxForStructureOp(fallbackIdx: string): string {
  const active = getShadowRoot()?.activeElement;
  if (!(active instanceof Element)) {
    return fallbackIdx;
  }

  const uid =
    active.getAttribute(DATA_EE_BLOCK_UID) ??
    active.closest(`[${EE_UID_ATTR}]`)?.getAttribute(EE_UID_ATTR);
  if (uid) {
    const idx = uidToIdx(uid);
    if (idx) {
      return idx;
    }
  }

  const fieldPath =
    resolveContentEditableFormPath(active) ??
    active.getAttribute(DATA_CONTENT_EDITABLE_IDX);
  if (fieldPath) {
    return blockIdxFromContentFieldPath(fieldPath);
  }

  return fallbackIdx;
}
