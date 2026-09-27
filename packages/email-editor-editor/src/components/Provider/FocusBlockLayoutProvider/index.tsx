import { useFocusIdx } from '@/hooks/useFocusIdx';
import React, { useEffect, useMemo, useState } from 'react';
import { getPageIdx } from '@wa-dev/email-editor-blocks-react';
import { getBlockNodeByIdx } from '@/utils/getBlockNodeByIdx';
import { getPageCanvasAnchorNode } from '@/utils/getPageCanvasAnchorNode';
import { getShadowRoot } from '@/utils/getShadowRoot';
import { DATA_RENDER_COUNT } from '@/constants';
import { EE_CANVAS_MOUNT_EVENT } from '@/canvas-mount/canvasMountEvents';
import { useEditorContext } from '@/hooks/useEditorContext';
import { useRefState } from '@/hooks/useRefState';

export const FocusBlockLayoutContext = React.createContext<{
  focusBlockNode: HTMLElement | null;
}>({
  focusBlockNode: null,
});

function syncFocusBlockNode(
  focusIdx: string,
  setFocusBlockNode: (node: HTMLElement | null) => void,
) {
  if (!focusIdx) {
    setFocusBlockNode(null);
    return;
  }

  if (focusIdx === getPageIdx()) {
    setFocusBlockNode(getPageCanvasAnchorNode());
    return;
  }

  const ele = getBlockNodeByIdx(focusIdx);
  setFocusBlockNode(ele);
}

export const FocusBlockLayoutProvider: React.FC<{
  children?: React.ReactNode;
}> = (props) => {
  const [focusBlockNode, setFocusBlockNode] = useState<HTMLElement | null>(null);
  const { initialized } = useEditorContext();
  const { focusIdx } = useFocusIdx();
  const focusIdxRef = useRefState(focusIdx);

  const root = useMemo(() => {
    return initialized
      ? (getShadowRoot()?.querySelector(`[${DATA_RENDER_COUNT}]`) as HTMLElement | null)
      : null;
  }, [initialized]);

  useEffect(() => {
    if (!root) return;

    syncFocusBlockNode(focusIdxRef.current, setFocusBlockNode);

    let lastCount = root.getAttribute(DATA_RENDER_COUNT);
    const observer = new MutationObserver(() => {
      const currentCount = root.getAttribute(DATA_RENDER_COUNT);
      if (lastCount !== currentCount) {
        lastCount = currentCount;
        syncFocusBlockNode(focusIdxRef.current, setFocusBlockNode);
      }
    });

    observer.observe(root, {
      attributeFilter: [DATA_RENDER_COUNT],
    });

    const shadow = getShadowRoot();
    const onCanvasMount = () => {
      syncFocusBlockNode(focusIdxRef.current, setFocusBlockNode);
    };

    shadow?.addEventListener(EE_CANVAS_MOUNT_EVENT, onCanvasMount);

    return () => {
      observer.disconnect();
      shadow?.removeEventListener(EE_CANVAS_MOUNT_EVENT, onCanvasMount);
    };
  }, [focusIdxRef, root]);

  useEffect(() => {
    if (!focusIdx) {
      setFocusBlockNode(null);
      return;
    }
    if (root) {
      syncFocusBlockNode(focusIdx, setFocusBlockNode);
    }
  }, [focusIdx, root]);

  const value = useMemo(() => {
    return {
      focusBlockNode,
    };
  }, [focusBlockNode]);

  return (
    <FocusBlockLayoutContext.Provider value={value}>
      {props.children}
    </FocusBlockLayoutContext.Provider>
  );
};
