import {
  getBlockNodeByIdx,
  useFocusBlockLayout,
  useFocusIdx,
} from '@wa-dev/email-editor-editor';
import { useMemo } from 'react';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import {
  FormatCommand,
  getFormatState,
} from '../utils/selection';

export function useFormatActive(command: FormatCommand) {
  const { focusIdx } = useFocusIdx();
  const { selectionRange } = useSelectionRange();
  const { focusBlockNode } = useFocusBlockLayout();
  const liveBlockNode = getBlockNodeByIdx(focusIdx) ?? focusBlockNode;

  return useMemo(
    () => getFormatState(command, selectionRange, liveBlockNode),
    [command, selectionRange, liveBlockNode],
  );
}
