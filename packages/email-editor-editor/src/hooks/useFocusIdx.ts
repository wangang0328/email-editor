import { BlocksContext } from '@/components/Provider/BlocksProvider';
import { useContext } from 'react';

export function useFocusIdx() {
  const {
    focusIdx,
    setFocusIdx,
    configPanelOpen,
    notifyFocusSelection,
    dismissConfigPanel,
  } = useContext(BlocksContext);

  return {
    focusIdx,
    setFocusIdx,
    configPanelOpen,
    notifyFocusSelection,
    dismissConfigPanel,
  };
}
