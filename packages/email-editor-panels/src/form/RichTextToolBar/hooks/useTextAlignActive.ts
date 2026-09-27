import { useFocusBlockLayout } from '@wa-dev/email-editor-editor';
import { useMemo } from 'react';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import {
  getTextAlignState,
  TextAlignValue,
} from '../utils/selection';

export function useTextAlignActive(align: TextAlignValue) {
  const { selectionRange } = useSelectionRange();
  const { focusBlockNode } = useFocusBlockLayout();

  return useMemo(
    () => getTextAlignState(selectionRange, focusBlockNode) === align,
    [align, selectionRange, focusBlockNode],
  );
}
