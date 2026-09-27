export type FontFamilyOptionItem = {
  value: string;
  label: string;
};

export const COMMON_FONT_OPTIONS: FontFamilyOptionItem[] = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'PingFang SC', label: '苹方' },
  { value: '-apple-system', label: 'Apple System' },
  { value: 'BlinkMacSystemFont', label: 'BlinkMacSystemFont' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'sans-serif', label: 'sans-serif' },
  { value: 'serif', label: 'serif' },
];

export function parseFontFamilyValue(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(part => part.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);
}

export function buildFontFamilyOptions(
  extraValues: string[] = [],
  options?: { prepend?: boolean },
): FontFamilyOptionItem[] {
  const base = [...COMMON_FONT_OPTIONS];
  const existingValues = new Set(base.map(item => item.value));
  const extras: FontFamilyOptionItem[] = [];

  extraValues.forEach(value => {
    if (!value || existingValues.has(value)) return;
    existingValues.add(value);
    extras.push({ value, label: value });
  });

  return options?.prepend ? [...extras, ...base] : [...base, ...extras];
}

/** 合并页面自定义字体、内置字体与编辑器额外配置 */
export function resolveFontFamilyOptions(input?: {
  editorFontValues?: string[];
  customFontNames?: string[];
}): FontFamilyOptionItem[] {
  const customNames = [...new Set(input?.customFontNames?.filter(Boolean) ?? [])];
  const editorValues = input?.editorFontValues?.filter(Boolean) ?? [];

  const customOptions = customNames.map(name => ({ value: name, label: name }));
  const customValueSet = new Set(customNames);

  const baseOptions = buildFontFamilyOptions(editorValues).filter(
    item => !customValueSet.has(item.value),
  );

  return [...customOptions, ...baseOptions];
}
