import { create } from 'zustand';
import { BlockGroup, CollectedBlock } from '@wa-dev/email-editor-editor';

export const COLLECTION_KEY = 'COLLECTION_KEY';

const defaultData = [
  {
    title: 'Collection',
    name: 'Collection',
    blocks: [] as {
      title: string;
      description?: React.ReactNode;
      ExampleComponent: () => JSX.Element;
    }[],
  },
];

const initialData = JSON.parse(
  localStorage.getItem(COLLECTION_KEY) || JSON.stringify(defaultData),
) as BlockGroup[];

interface ExtraBlocksStore {
  blocks: BlockGroup[];
  set: (blocks: BlockGroup[]) => void;
  add: (block: CollectedBlock) => void;
  remove: (id: string) => void;
}

export const useExtraBlocksStore = create<ExtraBlocksStore>((set, get) => ({
  blocks: initialData,
  set: (blocks) => {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(blocks));
    set({ blocks });
  },
  add: (block) => {
    const next = [...get().blocks];
    next[0].blocks.push(block);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(next));
    set({ blocks: next });
  },
  remove: (id) => {
    const next = [...get().blocks];
    next[0].blocks = next[0].blocks.filter((item) => item.id !== id);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(next));
    set({ blocks: next });
  },
}));
