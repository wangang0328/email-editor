import { useLoadingStore } from '@demo/store/loadingStore';

export function useLoading(keys: string | string[]) {
  const loadings = useLoadingStore((state) => state.loadings);
  return Array.isArray(keys) ? keys.some((key) => loadings[key]) : loadings[keys];
}

export function getLoadingByKey(key: string, actionKey: string | number) {
  return `${key}/${actionKey}`;
}
