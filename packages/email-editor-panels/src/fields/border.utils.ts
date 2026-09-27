export const DEFAULT_BORDER_COLOR = '#000000';
export const DEFAULT_BORDER_WIDTH = '1';
export const DEFAULT_BORDER_STYLE = 'solid';

export type BorderStyleValue = 'solid' | 'dashed' | 'dotted';

export type ParsedBorder = {
  enabled: boolean;
  width: string;
  style: BorderStyleValue;
  color: string;
};

const BORDER_SHORTHAND_RE =
  /^(\d+(?:\.\d+)?px)\s+(solid|dashed|dotted|double|ridge|groove|inset|outset)\s+(.+)$/i;

function normalizeBorderStyle(style: string): BorderStyleValue {
  const lower = style.toLowerCase();
  if (lower === 'dashed' || lower === 'dotted') return lower;
  return 'solid';
}

export function parseBorder(border?: string): ParsedBorder {
  if (!border || border.trim() === '' || border.trim().toLowerCase() === 'none') {
    return {
      enabled: false,
      width: DEFAULT_BORDER_WIDTH,
      style: DEFAULT_BORDER_STYLE,
      color: DEFAULT_BORDER_COLOR,
    };
  }

  const match = border.trim().match(BORDER_SHORTHAND_RE);
  if (!match) {
    return {
      enabled: true,
      width: DEFAULT_BORDER_WIDTH,
      style: DEFAULT_BORDER_STYLE,
      color: DEFAULT_BORDER_COLOR,
    };
  }

  return {
    enabled: true,
    width: match[1].replace(/px$/i, ''),
    style: normalizeBorderStyle(match[2]),
    color: match[3].trim() || DEFAULT_BORDER_COLOR,
  };
}

export function formatBorder(width: string, style: string, color: string): string {
  const normalizedWidth = width.toString().trim() || DEFAULT_BORDER_WIDTH;
  const widthWithUnit = /px$/i.test(normalizedWidth)
    ? normalizedWidth
    : `${normalizedWidth}px`;
  const normalizedColor = color.trim() || DEFAULT_BORDER_COLOR;
  return `${widthWithUnit} ${style} ${normalizedColor}`;
}

export function parseBorderRadius(radius?: string): string {
  if (!radius || radius.trim() === '') return '';
  const trimmed = radius.trim();
  if (/^\d+(?:\.\d+)?px$/i.test(trimmed)) {
    return trimmed.replace(/px$/i, '');
  }
  return trimmed.replace(/px$/i, '');
}

export function formatBorderRadius(radius: string): string | undefined {
  const trimmed = radius.toString().trim();
  if (!trimmed) return undefined;
  if (/^\d+(?:\.\d+)?$/i.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}
