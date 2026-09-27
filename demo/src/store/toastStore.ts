import { create } from 'zustand';

export interface Toast {
  id: number;
  type: string;
  message: string;
  duration: number;
}

let toastId = 0;

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: toastId++, ...toast }],
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    })),
}));
