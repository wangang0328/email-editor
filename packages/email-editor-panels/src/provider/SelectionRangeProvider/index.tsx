/* eslint-disable @typescript-eslint/no-unsafe-call */
import { RICH_TEXT_TOOL_BAR } from '@panels/constants';
import {
  ContentEditableType,
  DATA_CONTENT_EDITABLE_TYPE,
  EE_CANVAS_MOUNT_EVENT,
  getShadowRoot,
  getShadowSelection,
} from '@wa-dev/email-editor-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';

function isInRichTextContentEditable(node: Node): boolean {
  let current: Node | null = node;
  while (current) {
    if (
      current instanceof HTMLElement &&
      current.getAttribute('contenteditable') === 'true' &&
      current.getAttribute(DATA_CONTENT_EDITABLE_TYPE) === ContentEditableType.RichText
    ) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

/** 从 Shadow DOM 当前选区捕获 Range，供 execCommand / 画布挂载后刷新工具栏高亮 */
export function captureShadowSelection(): Range | null {
  try {
    const selection = getShadowSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const toolbar = getShadowRoot()?.getElementById(RICH_TEXT_TOOL_BAR);
    if (toolbar?.contains(range.commonAncestorContainer)) {
      return null;
    }

    if (!isInRichTextContentEditable(range.commonAncestorContainer)) {
      return null;
    }

    return range.cloneRange();
  } catch {
    return null;
  }
}

export const SelectionRangeContext = React.createContext<{
  selectionRange: Range | null;
  setSelectionRange: React.Dispatch<React.SetStateAction<Range | null>>;
}>({
  selectionRange: null,
  setSelectionRange: () => {},
});

export const SelectionRangeProvider: React.FC<{
  children: React.ReactNode | React.ReactElement;
}> = props => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const lastValidRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const cloned = captureShadowSelection();
      if (!cloned) {
        return;
      }
      lastValidRangeRef.current = cloned;
      setSelectionRange(cloned);
    };

    const shadow = getShadowRoot();
    const onCanvasMount = () => {
      const captured = captureShadowSelection();
      if (captured) {
        lastValidRangeRef.current = captured;
        setSelectionRange(captured);
      } else if (
        lastValidRangeRef.current &&
        !lastValidRangeRef.current.startContainer.isConnected
      ) {
        setSelectionRange(null);
      }
    };

    document.addEventListener('selectionchange', onSelectionChange);
    // execCommand 改 DOM 后部分浏览器不触发 document selectionchange，用 input 补一次
    shadow?.addEventListener('input', onSelectionChange, true);
    shadow?.addEventListener(EE_CANVAS_MOUNT_EVENT, onCanvasMount);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      shadow?.removeEventListener('input', onSelectionChange, true);
      shadow?.removeEventListener(EE_CANVAS_MOUNT_EVENT, onCanvasMount);
    };
  }, []);

  const value = useMemo(() => {
    return {
      selectionRange,
      setSelectionRange,
    };
  }, [selectionRange]);

  return useMemo(() => {
    return (
      <SelectionRangeContext.Provider value={value}>
        {props.children}
      </SelectionRangeContext.Provider>
    );
  }, [props.children, value]);
};
