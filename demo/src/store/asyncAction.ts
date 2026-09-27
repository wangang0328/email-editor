import { useLoadingStore } from './loadingStore';
import { useToastStore } from './toastStore';

export function loadingKey(namespace: string, action: string, actionKey?: string | number) {
  const base = `${namespace}/${action}`;
  return actionKey != null ? `${base}/${actionKey}` : base;
}

export async function runAsyncAction<State, Payload, Result = State>(
  namespace: string,
  action: string,
  getState: () => State,
  setState: (next: State) => void,
  payload: Payload & { _actionKey?: string | number },
  effect: (state: State, payload: Payload) => Promise<Result | void | undefined>,
) {
  const key = loadingKey(namespace, action, payload._actionKey);
  useLoadingStore.getState().startLoading(key);
  try {
    const data = await effect(getState(), payload);
    if (data !== undefined) {
      setState(data as State);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    useToastStore.getState().add({
      message,
      duration: 1.5,
      type: 'error',
    });
  } finally {
    useLoadingStore.getState().endLoading(key);
  }
}
export function createActionKeys<T extends string>(namespace: string, actions: T[]) {
  return Object.fromEntries(actions.map((a) => [a, `${namespace}/${a}`])) as Record<T, string>;
}

