import { useFocusBlockLayout } from '@wa-dev/email-editor-editor';
import { useMemo } from 'react';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import { getFontSizeState } from '../utils/selection';

export function useFontSizeState() {
  const { selectionRange } = useSelectionRange();
  const { focusBlockNode } = useFocusBlockLayout();

  return useMemo(
    () => getFontSizeState(selectionRange, focusBlockNode),
    [selectionRange, focusBlockNode],
  );
}
