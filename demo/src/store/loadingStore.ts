import { create } from 'zustand';

export type LoadingState = Record<string, boolean>;

interface LoadingStore {
  loadings: LoadingState;
  startLoading: (key: string) => void;
  endLoading: (key: string) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loadings: {},
  startLoading: (key) =>
    set((state) => ({
      loadings: { ...state.loadings, [key]: true },
    })),
  endLoading: (key) =>
    set((state) => ({
      loadings: { ...state.loadings, [key]: false },
    })),
}));
