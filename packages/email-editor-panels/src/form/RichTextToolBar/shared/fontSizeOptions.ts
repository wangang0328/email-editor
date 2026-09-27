export type FontSizeOption = {
  value: string;
  label: string;
  px: string;
};

export const RICH_TEXT_FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: '1', label: '12px', px: '12px' },
  { value: '2', label: '13px', px: '13px' },
  { value: '3', label: '16px', px: '16px' },
  { value: '4', label: '18px', px: '18px' },
  { value: '5', label: '24px', px: '24px' },
  { value: '6', label: '32px', px: '32px' },
  { value: '7', label: '48px', px: '48px' },
];

const PX_TO_VALUE = new Map(
  RICH_TEXT_FONT_SIZE_OPTIONS.map(item => [item.px, item.value]),
);

const VALUE_TO_PX = new Map(
  RICH_TEXT_FONT_SIZE_OPTIONS.map(item => [item.value, item.px]),
);

const LEGACY_FONT_SIZE_TO_PX: Record<string, string> = {
  '1': '12px',
  '2': '13px',
  '3': '16px',
  '4': '18px',
  '5': '24px',
  '6': '32px',
  '7': '48px',
};

export function resolveFontSizePx(sizeValue: string): string {
  return VALUE_TO_PX.get(sizeValue) ?? sizeValue;
}

export function normalizeFontSizePx(computed: string): string {
  const trimmed = (computed || '').trim().toLowerCase();
  if (!trimmed) return '';
  if (PX_TO_VALUE.has(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d+(?:\.\d+)?)px$/);
  if (match) return `${Math.round(parseFloat(match[1]))}px`;
  return trimmed;
}

export function getFontSizeValueFromPx(px: string): string {
  const normalized = normalizeFontSizePx(px);
  return PX_TO_VALUE.get(normalized) ?? '';
}

export function getFontSizePxFromLegacySize(size: string | null): string | null {
  if (!size) return null;
  return LEGACY_FONT_SIZE_TO_PX[size.trim()] ?? null;
}
