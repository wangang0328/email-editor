import { create } from 'zustand';
import services from '@demo/services';
import { createActionKeys, runAsyncAction } from './asyncAction';

const NAMESPACE = 'email';

interface EmailStore {
  send: (payload: {
    data: Parameters<typeof services.common.sendTestEmail>[0];
    success: () => void;
  }) => Promise<void>;
}

export const useEmailStore = create<EmailStore>(() => ({
  send: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'send',
      () => null,
      () => {},
      payload,
      async () => {
        await services.common.sendTestEmail(payload.data);
        payload.success();
      },
    ),
}));

const loadings = createActionKeys(NAMESPACE, ['send']);

const email = {
  loadings,
  actions: {
    send: (payload: Parameters<EmailStore['send']>[0]) =>
      useEmailStore.getState().send(payload),
  },
};

export default email;
