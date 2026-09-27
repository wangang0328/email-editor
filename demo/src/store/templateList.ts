import { create } from 'zustand';
import { IArticle } from '@demo/services/article';
import { createActionKeys, runAsyncAction } from './asyncAction';

const NAMESPACE = 'templateList';

interface TemplateListStore {
  list: IArticle[];
  fetch: () => Promise<void>;
}

export const useTemplateListStore = create<TemplateListStore>((set, get) => ({
  list: [],
  fetch: () =>
    runAsyncAction(
      NAMESPACE,
      'fetch',
      () => get().list,
      (list) => set({ list }),
      {},
      async () => {
        const provideUserData: IArticle[] = [];
        const list = [...provideUserData];
        list.sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1));
        return list;
      },
    ),
}));
const loadings = createActionKeys(NAMESPACE, ['fetch']);

const templateList = {
  loadings,
  actions: {
    fetch: () => useTemplateListStore.getState().fetch(),
  },
};

export default templateList;

