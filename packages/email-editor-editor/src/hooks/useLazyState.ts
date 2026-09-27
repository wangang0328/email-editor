import { debounce } from 'lodash-es';
import { useCallback, useState, useEffect } from 'react';

export function useLazyState<T>(state: T, debounceTime: number) {
  const [lazyState, setLazyState] = useState<T>(state);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setDebounceLazyState: React.Dispatch<React.SetStateAction<T>> = useCallback(debounce((s) => {
    setLazyState(s);
  }, debounceTime), [debounceTime]);

  useEffect(() => {
    if (debounceTime <= 0) {
      setLazyState(state);
      return;
    }
    setDebounceLazyState(state);
  }, [debounceTime, setDebounceLazyState, state]);

  return lazyState;
}
