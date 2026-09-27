import React, { useEffect } from 'react';
import { Message } from '@demo/components/app-ui';
import { useToastStore } from '@demo/store/toastStore';

export default function Page({ children }: { children: React.ReactNode }) {
  const errToast = useToastStore((state) => state.toasts);

  useEffect(() => {
    const current = errToast[0];
    if (!current) return;

    useToastStore.getState().remove(current.id);
    console.error(current);
    Message.error({
      content: current.message,
      duration: current.duration,
    });
  }, [errToast]);

  return <>{children}</>;
}
