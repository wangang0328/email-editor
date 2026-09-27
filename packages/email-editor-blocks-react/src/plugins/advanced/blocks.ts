import type { IButton } from '@blocks/plugins/standard/button';
import type { ICarousel } from '@blocks/plugins/standard/carousel';
import type { IDivider } from '@blocks/plugins/standard/divider';
import type { IImage } from '@blocks/plugins/standard/image';
import type { INavbar } from '@blocks/plugins/standard/navbar';
import type { ISpacer } from '@blocks/plugins/standard/spacer';
import type { IText } from '@blocks/plugins/standard/text';
import type { IAccordion } from '@blocks/plugins/standard/accordion';
import type { ISocial } from '@blocks/plugins/standard/social';
import type { IWrapper } from '@blocks/plugins/standard/wrapper';
import type { ISection } from '@blocks/plugins/standard/section';
import type { IGroup } from '@blocks/plugins/standard/group';
import type { IColumn } from '@blocks/plugins/standard/column';
import type { IHero } from '@blocks/plugins/standard/hero';
import type { ITable } from '@blocks/plugins/standard/table';
import { AdvancedType, BasicType } from '@wa-dev/email-editor-shared';
import { generateAdvancedContentBlock } from './generateAdvancedContentBlock';
import { generateAdvancedLayoutBlock } from './generateAdvancedLayoutBlock';
import { generateAdvancedTableBlock } from './generateAdvancedTableBlock';

export const AdvancedText = generateAdvancedContentBlock<IText>({
  type: AdvancedType.TEXT,
  baseType: BasicType.TEXT,
});

export const AdvancedButton = generateAdvancedContentBlock<IButton>({
  type: AdvancedType.BUTTON,
  baseType: BasicType.BUTTON,
});

export const AdvancedImage = generateAdvancedContentBlock<IImage>({
  type: AdvancedType.IMAGE,
  baseType: BasicType.IMAGE,
});

export const AdvancedDivider = generateAdvancedContentBlock<IDivider>({
  type: AdvancedType.DIVIDER,
  baseType: BasicType.DIVIDER,
});

export const AdvancedSpacer = generateAdvancedContentBlock<ISpacer>({
  type: AdvancedType.SPACER,
  baseType: BasicType.SPACER,
});

export const AdvancedNavbar = generateAdvancedContentBlock<INavbar>({
  type: AdvancedType.NAVBAR,
  baseType: BasicType.NAVBAR,
});

export const AdvancedAccordion = generateAdvancedContentBlock<IAccordion>({
  type: AdvancedType.ACCORDION,
  baseType: BasicType.ACCORDION,
});

export const AdvancedCarousel = generateAdvancedContentBlock<ICarousel>({
  type: AdvancedType.CAROUSEL,
  baseType: BasicType.CAROUSEL,
});

export const AdvancedSocial = generateAdvancedContentBlock<ISocial>({
  type: AdvancedType.SOCIAL,
  baseType: BasicType.SOCIAL,
});

export const AdvancedTable = generateAdvancedTableBlock({
  type: AdvancedType.TABLE,
  baseType: BasicType.TABLE,
});

export const AdvancedWrapper = generateAdvancedLayoutBlock<IWrapper>({
  type: AdvancedType.WRAPPER,
  baseType: BasicType.WRAPPER,
  validParentType: [BasicType.PAGE],
});

export const AdvancedSection = generateAdvancedLayoutBlock<ISection>({
  type: AdvancedType.SECTION,
  baseType: BasicType.SECTION,
  validParentType: [BasicType.PAGE, BasicType.WRAPPER, AdvancedType.WRAPPER],
});

export const AdvancedGroup = generateAdvancedLayoutBlock<IGroup>({
  type: AdvancedType.GROUP,
  baseType: BasicType.GROUP,
  validParentType: [BasicType.SECTION, AdvancedType.SECTION],
});

export const AdvancedColumn = generateAdvancedLayoutBlock<IColumn>({
  type: AdvancedType.COLUMN,
  baseType: BasicType.COLUMN,
  validParentType: [
    BasicType.SECTION,
    AdvancedType.SECTION,
    BasicType.GROUP,
    AdvancedType.GROUP,
  ],
});

export const AdvancedHero = generateAdvancedLayoutBlock<IHero>({
  type: AdvancedType.HERO,
  baseType: BasicType.HERO,
  validParentType: [BasicType.WRAPPER, AdvancedType.WRAPPER, BasicType.PAGE],
});
