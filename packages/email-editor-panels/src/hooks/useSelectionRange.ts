/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useMemoizedFn } from 'ahooks';
import { useContext } from 'react';
import { SelectionRangeContext } from '@panels/provider/SelectionRangeProvider';
import { getShadowSelection } from '@wa-dev/email-editor-editor';

export function useSelectionRange() {
  const { selectionRange, setSelectionRange } = useContext(
    SelectionRangeContext
  );

  const restoreRange = useMemoizedFn((range: Range) => {
    const selection = getShadowSelection();
    if (!selection) {
      return;
    }
    selection.removeAllRanges();
    const newRange = document.createRange();

    try {
      if (
        range.startContainer.isConnected &&
        range.endContainer.isConnected
      ) {
        newRange.setStart(range.startContainer, range.startOffset);
        newRange.setEnd(range.endContainer, range.endOffset);
      } else {
        throw new Error('detached range');
      }
    } catch {
      if (range.commonAncestorContainer instanceof HTMLElement) {
        newRange.selectNodeContents(range.commonAncestorContainer);
      }
    }

    selection.addRange(newRange);
  });

  const setRangeByElement = useMemoizedFn((element: ChildNode) => {
    const selection = getShadowSelection();
    if (!selection) {
      return;
    }

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNode(element);
    setSelectionRange(newRange);
    selection.addRange(newRange);
  });

  return {
    selectionRange,
    setSelectionRange,
    restoreRange,
    setRangeByElement,
  };
}
