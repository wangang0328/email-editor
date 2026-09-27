import { AdvancedType, BasicType } from '@wa-dev/email-editor-blocks-react';
import { get } from 'lodash-es';
import {
  AlignVerticalSpaceAround,
  ChevronsUpDown,
  Columns2,
  FileText,
  GalleryHorizontalEnd,
  Group,
  Hash,
  Image,
  LayoutTemplate,
  Minus,
  MousePointerClick,
  Package,
  PanelTop,
  Share2,
  SquareDashed,
  Table2,
  Type,
  type LucideIcon,
} from 'lucide-react';

export type BlockIconAccent = {
  bg: string;
  fg: string;
};

let iconsMap: Record<string, LucideIcon> = {
  [BasicType.TEXT]: Type,
  [BasicType.SECTION]: SquareDashed,
  [BasicType.COLUMN]: Columns2,
  [BasicType.DIVIDER]: Minus,
  [BasicType.IMAGE]: Image,
  [BasicType.BUTTON]: MousePointerClick,
  [BasicType.GROUP]: Group,
  [BasicType.PAGE]: FileText,
  [BasicType.WRAPPER]: Package,
  [BasicType.NAVBAR]: PanelTop,
  [BasicType.HERO]: LayoutTemplate,
  [BasicType.SPACER]: AlignVerticalSpaceAround,
  [BasicType.SOCIAL]: Share2,
  [BasicType.CAROUSEL]: GalleryHorizontalEnd,
  [BasicType.ACCORDION]: ChevronsUpDown,
  [BasicType.TABLE]: Table2,

  [AdvancedType.TEXT]: Type,
  [AdvancedType.DIVIDER]: Minus,
  [AdvancedType.IMAGE]: Image,
  [AdvancedType.BUTTON]: MousePointerClick,
  [AdvancedType.NAVBAR]: PanelTop,
  [AdvancedType.SPACER]: AlignVerticalSpaceAround,
  [AdvancedType.SOCIAL]: Share2,
  [AdvancedType.CAROUSEL]: GalleryHorizontalEnd,
  [AdvancedType.ACCORDION]: ChevronsUpDown,
  [AdvancedType.WRAPPER]: Package,
  [AdvancedType.SECTION]: SquareDashed,
  [AdvancedType.COLUMN]: Columns2,
  [AdvancedType.GROUP]: Group,
  [AdvancedType.HERO]: LayoutTemplate,
  [AdvancedType.TABLE]: Table2,
};

/** 柔和色底，提升块类型辨识度（避免彩虹高饱和） */
const accentMap: Record<string, BlockIconAccent> = {
  [BasicType.TEXT]: { bg: 'rgba(37, 99, 235, 0.10)', fg: '#2563eb' },
  [BasicType.IMAGE]: { bg: 'rgba(13, 148, 136, 0.10)', fg: '#0d9488' },
  [BasicType.BUTTON]: { bg: 'rgba(79, 70, 229, 0.10)', fg: '#4f46e5' },
  [BasicType.DIVIDER]: { bg: 'rgba(100, 116, 139, 0.12)', fg: '#64748b' },
  [BasicType.SPACER]: { bg: 'rgba(100, 116, 139, 0.12)', fg: '#64748b' },
  [BasicType.SOCIAL]: { bg: 'rgba(14, 165, 233, 0.10)', fg: '#0284c7' },
  [BasicType.HERO]: { bg: 'rgba(217, 119, 6, 0.10)', fg: '#d97706' },
  [BasicType.NAVBAR]: { bg: 'rgba(15, 23, 42, 0.08)', fg: '#334155' },
  [BasicType.CAROUSEL]: { bg: 'rgba(219, 39, 119, 0.08)', fg: '#db2777' },
  [BasicType.ACCORDION]: { bg: 'rgba(124, 58, 237, 0.08)', fg: '#7c3aed' },
  [BasicType.TABLE]: { bg: 'rgba(22, 163, 74, 0.10)', fg: '#16a34a' },
  [BasicType.SECTION]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [BasicType.COLUMN]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [BasicType.GROUP]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [BasicType.WRAPPER]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [BasicType.PAGE]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },

  [AdvancedType.TEXT]: { bg: 'rgba(37, 99, 235, 0.10)', fg: '#2563eb' },
  [AdvancedType.IMAGE]: { bg: 'rgba(13, 148, 136, 0.10)', fg: '#0d9488' },
  [AdvancedType.BUTTON]: { bg: 'rgba(79, 70, 229, 0.10)', fg: '#4f46e5' },
  [AdvancedType.DIVIDER]: { bg: 'rgba(100, 116, 139, 0.12)', fg: '#64748b' },
  [AdvancedType.SPACER]: { bg: 'rgba(100, 116, 139, 0.12)', fg: '#64748b' },
  [AdvancedType.SOCIAL]: { bg: 'rgba(14, 165, 233, 0.10)', fg: '#0284c7' },
  [AdvancedType.HERO]: { bg: 'rgba(217, 119, 6, 0.10)', fg: '#d97706' },
  [AdvancedType.NAVBAR]: { bg: 'rgba(15, 23, 42, 0.08)', fg: '#334155' },
  [AdvancedType.CAROUSEL]: { bg: 'rgba(219, 39, 119, 0.08)', fg: '#db2777' },
  [AdvancedType.ACCORDION]: { bg: 'rgba(124, 58, 237, 0.08)', fg: '#7c3aed' },
  [AdvancedType.TABLE]: { bg: 'rgba(22, 163, 74, 0.10)', fg: '#16a34a' },
  [AdvancedType.SECTION]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [AdvancedType.COLUMN]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [AdvancedType.GROUP]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
  [AdvancedType.WRAPPER]: { bg: 'rgba(15, 23, 42, 0.06)', fg: '#475569' },
};

const defaultAccent: BlockIconAccent = {
  bg: 'rgba(15, 23, 42, 0.06)',
  fg: '#64748b',
};

export function getBlockTypeIcon(type: string): LucideIcon {
  return get(iconsMap, type) ?? Hash;
}

export function getBlockTypeAccent(type: string): BlockIconAccent {
  return accentMap[type] ?? defaultAccent;
}

export function setBlockTypeIcons(map: Record<string, LucideIcon>) {
  iconsMap = { ...iconsMap, ...map };
}

/** @deprecated use getBlockTypeIcon */
export const getIconNameByBlockType = getBlockTypeIcon;

/** @deprecated use setBlockTypeIcons */
export const setIconsMap = setBlockTypeIcons;
