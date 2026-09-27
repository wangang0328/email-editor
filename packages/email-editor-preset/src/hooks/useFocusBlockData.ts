import { useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { getPageIdx, getValueByIdx, IBlockData } from '@wa-dev/email-editor-blocks-react';
import { useMemo } from 'react';

/** 按 focusIdx 解析当前选中块数据，与画布选中状态严格一致 */
export function useFocusBlockData(): IBlockData | null {
  const { values } = useBlock();
  const { focusIdx } = useFocusIdx();
  const pageIdx = getPageIdx();

  return useMemo(() => {
    if (!values?.content || !focusIdx) return null;
    const block = getValueByIdx(values, focusIdx) as IBlockData | null;
    if (block) return block;
    if (focusIdx === pageIdx) return values.content;
    return null;
  }, [values, focusIdx, pageIdx]);
}
