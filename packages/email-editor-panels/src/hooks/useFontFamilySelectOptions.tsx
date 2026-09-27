import { useFontFamily } from '@panels/hooks/useFontFamily';

/** 与富文本工具栏共用同一份字体选项数据 */
export function useFontFamilySelectOptions() {
  const { fontList } = useFontFamily();
  return { options: fontList };
}
