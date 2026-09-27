import { create } from 'zustand';
import services from '@demo/services';
import { IUser } from '@demo/services/user';
import { createActionKeys, runAsyncAction } from './asyncAction';

const NAMESPACE = 'user';

interface UserStore {
  user: IUser | null;
  fetch: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  fetch: () =>
    runAsyncAction(
      NAMESPACE,
      'fetch',
      () => get().user,
      (user) => set({ user }),
      {},
      async () => services.user.getInfo(),
    ),
}));

const loadings = createActionKeys(NAMESPACE, ['fetch']);

const user = {
  loadings,
  actions: {
    fetch: () => useUserStore.getState().fetch(),
  },
};

export default user;
