import { BasicType } from '@wa-dev/email-editor-shared';
import type { IBlock } from '@blocks/typings';
import { Page } from './page';
import { Section } from './section';
import { Column } from './column';
import { Text } from './text';
import { Image } from './image';
import { Group } from './group';
import { Button } from './button';
import { Divider } from './divider';
import { Wrapper } from './wrapper';
import { Spacer } from './spacer';
import { Carousel } from './carousel';
import { Hero } from './hero';
import { Navbar } from './navbar';
import { Social } from './social';
import { Raw } from './raw';
import { Template } from './template';
import { AccordionElement } from './accordion-element';
import { AccordionTitle } from './accordion-title';
import { AccordionText } from './accordion-text';
import { Accordion } from './accordion';
import { Table } from './table';

/** 标准块映射（独立模块，避免与 advanced 插件循环引用） */
export const standardBaseBlocks: Record<string, IBlock> = {
  [BasicType.PAGE]: Page,
  [BasicType.SECTION]: Section,
  [BasicType.COLUMN]: Column,
  [BasicType.TEXT]: Text,
  [BasicType.IMAGE]: Image,
  [BasicType.GROUP]: Group,
  [BasicType.BUTTON]: Button,
  [BasicType.DIVIDER]: Divider,
  [BasicType.WRAPPER]: Wrapper,
  [BasicType.SPACER]: Spacer,
  [BasicType.RAW]: Raw,
  [BasicType.CAROUSEL]: Carousel,
  [BasicType.HERO]: Hero,
  [BasicType.NAVBAR]: Navbar,
  [BasicType.SOCIAL]: Social,
  [BasicType.TEMPLATE]: Template,
  [BasicType.ACCORDION]: Accordion,
  [BasicType.ACCORDION_ELEMENT]: AccordionElement,
  [BasicType.ACCORDION_TITLE]: AccordionTitle,
  [BasicType.ACCORDION_TEXT]: AccordionText,
  [BasicType.TABLE]: Table,
};
