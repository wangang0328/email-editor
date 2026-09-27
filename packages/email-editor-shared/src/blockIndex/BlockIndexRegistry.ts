import type { IBlockData } from '../types/block-data';
import { AdvancedType, BasicType } from '../types/block-types';
import { ensureBlockStableId } from '../stableId';
import { getChildIdx, getPageIdx } from '../tree';

const SEGMENT_BLOCK_TYPES = new Set<string>([
  BasicType.SECTION,
  BasicType.HERO,
  BasicType.GROUP,
  AdvancedType.SECTION,
  AdvancedType.HERO,
]);

export interface BlockIndexEntry {
  uid: string;
  idx: string;
  type: string;
  parentUid: string | null;
  segmentUid: string | null;
  childUids: string[];
}

/**
 * pageData 运行时索引：uid ↔ idx 双向映射。
 * 每次 content 变化后 rebuild，供交互层与挂载层使用。
 */
export class BlockIndexRegistry {
  private uidToEntry = new Map<string, BlockIndexEntry>();

  private idxToUidMap = new Map<string, string>();

  private segmentUidOrder: string[] = [];

  rebuild(pageData: IBlockData, rootIdx: string = getPageIdx()): void {
    this.uidToEntry.clear();
    this.idxToUidMap.clear();
    this.segmentUidOrder = [];

    const walk = (
      block: IBlockData,
      idx: string,
      parentUid: string | null,
      segmentUid: string | null,
    ) => {
      const uid = ensureBlockStableId(block);

      let nextSegmentUid = segmentUid;
      if (SEGMENT_BLOCK_TYPES.has(block.type)) {
        nextSegmentUid = uid;
        this.segmentUidOrder.push(uid);
      }

      block.children?.forEach((child, index) => {
        walk(child, getChildIdx(idx, index), uid, nextSegmentUid);
      });

      const childUids =
        block.children?.map((child) => ensureBlockStableId(child)) ?? [];

      const entry: BlockIndexEntry = {
        uid,
        idx,
        type: block.type,
        parentUid,
        segmentUid: nextSegmentUid,
        childUids,
      };

      this.uidToEntry.set(uid, entry);
      this.idxToUidMap.set(idx, uid);
    };

    pageData.children?.forEach((child, index) => {
      walk(child, getChildIdx(rootIdx, index), null, null);
    });
  }

  uidToIdx(uid: string): string | null {
    return this.uidToEntry.get(uid)?.idx ?? null;
  }

  idxToUid(idx: string): string | null {
    return this.idxToUidMap.get(idx) ?? null;
  }

  getEntry(uid: string): BlockIndexEntry | null {
    return this.uidToEntry.get(uid) ?? null;
  }

  segmentOrder(): string[] {
    return [...this.segmentUidOrder];
  }

  childrenOrder(parentUid: string): string[] {
    return [...(this.uidToEntry.get(parentUid)?.childUids ?? [])];
  }

  get size(): number {
    return this.uidToEntry.size;
  }
}
