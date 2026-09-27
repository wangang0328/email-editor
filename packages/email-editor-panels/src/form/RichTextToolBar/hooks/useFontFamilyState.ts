import { useFocusBlockLayout } from '@wa-dev/email-editor-editor';
import { useMemo } from 'react';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import { getFontFamilyState } from '../utils/selection';

export function useFontFamilyState() {
  const { selectionRange } = useSelectionRange();
  const { focusBlockNode } = useFocusBlockLayout();

  return useMemo(
    () => getFontFamilyState(selectionRange, focusBlockNode),
    [selectionRange, focusBlockNode],
  );
}
