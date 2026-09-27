import { useContext, useMemo } from 'react';
import { HoverIdxContext } from '@/components/Provider/HoverIdxProvider';

/** 拖放插入位置必须同步写入，debounce 会导致 dragend 时 parentIdx 仍未更新从而插不入画布 */
export function useDataTransfer() {
  const { dataTransfer, setDataTransfer } = useContext(HoverIdxContext);

  return useMemo(
    () => ({
      dataTransfer,
      setDataTransfer,
    }),
    [dataTransfer, setDataTransfer],
  );
}
