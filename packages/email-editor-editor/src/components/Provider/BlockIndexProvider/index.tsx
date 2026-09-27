import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-final-form';
import {
  BlockIndexRegistry,
  ensurePageBlockStableIds,
} from '@wa-dev/email-editor-shared';
import { IEmailTemplate } from '@/typings';
import { setBlockIndexRegistry } from '@/block-index/blockIndexStore';

interface BlockIndexContextValue {
  registry: BlockIndexRegistry;
  version: number;
}

const BlockIndexContext = createContext<BlockIndexContextValue | null>(null);

export function BlockIndexProvider({ children }: { children?: React.ReactNode }) {
  const form = useForm<IEmailTemplate>();
  const registryRef = useRef(new BlockIndexRegistry());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const sync = (content: IEmailTemplate['content']) => {
      if (!content) {
        setBlockIndexRegistry(null);
        return;
      }

      ensurePageBlockStableIds(content);
      registryRef.current.rebuild(content);
      setBlockIndexRegistry(registryRef.current);
      setVersion((v) => v + 1);
    };

    sync(form.getState().values.content);

    return form.subscribe(
      (state) => {
        sync(state.values.content);
      },
      { values: true },
    );
  }, [form]);

  const value = useMemo(
    () => ({
      registry: registryRef.current,
      version,
    }),
    [version],
  );

  return (
    <BlockIndexContext.Provider value={value}>{children}</BlockIndexContext.Provider>
  );
}

export function useBlockIndex(): BlockIndexRegistry {
  const ctx = useContext(BlockIndexContext);
  if (!ctx) {
    throw new Error('useBlockIndex must be used within BlockIndexProvider');
  }
  return ctx.registry;
}

export function useBlockIndexVersion(): number {
  const ctx = useContext(BlockIndexContext);
  return ctx?.version ?? 0;
}
