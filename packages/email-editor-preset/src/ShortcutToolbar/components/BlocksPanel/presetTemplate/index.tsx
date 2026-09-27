import { t } from '@lingui/core/macro';
import React from 'react';

/** Lingui macro `t` 在 TS 5.8 下仅支持标签模板，字符串参数走此包装 */
const translate = (message: string) => (t as unknown as (msg: string) => string)(message);
import { AdvancedType } from '@wa-dev/email-editor-blocks-react';
import { Stack, TextStyle } from '@wa-dev/email-editor-editor';

import { TextBlockItem } from './TextBlockItem';
import { ImageBlockItem } from './ImageBlockItem';
import { SpacerBlockItem } from './SpacerBlockItem';
import { DividerBlockItem } from './DividerBlockItem';
import { HeroBlockItem } from './HeroBlockItem';
import { ButtonBlockItem } from './ButtonBlockItem';
import { AccordionBlockItem } from './AccordionBlockItem';
import { CarouselBlockItem } from './CarouselBlockItem';
import { NavbarBlockItem } from './NavbarBlockItem';
import { SocialBlockItem } from './SocialBlockItem';
import { SectionBlockItem } from './SectionBlockItem';
import { GroupBlockItem } from './GroupBlockItem';
import { ColumnBlockItem } from './ColumnBlockItem';
import { TableBlockItem } from './TableBlockItem';

export const defaultCategories = [
  {
    get title() {
      return t({ context: 'layout.category', message: '内容' });
    },
    name: 'CONTENT',
    blocks: [
      {
        type: AdvancedType.TEXT,
        get title() {
          return t`文本`;
        },
        get description() {
          return t`此块用于在邮件中显示文本内容`;
        },
        component: TextBlockItem,
      },
      {
        type: AdvancedType.IMAGE,
        get title() {
          return t({ context: 'block.name', message: '图片' });
        },
        get description() {
          return (
            <Stack
              vertical
              spacing='none'
            >
              <TextStyle>
                {translate(
                  'Displays a responsive image in your email. It is similar to the HTML \'&lt;img/&gt;\' tag. Note that if no width is provided, the image will use the parent column width.',
                )}
              </TextStyle>
            </Stack>
          );
        },
        component: ImageBlockItem,
      },
      {
        type: AdvancedType.BUTTON,
        get title() {
          return t`按钮`;
        },
        get description() {
          return t`显示一个可自定义的按钮。`;
        },
        component: ButtonBlockItem,
      },
      {
        type: AdvancedType.HERO,
        get title() {
          return t`头图`;
        },
        get description() {
          return translate(
            'This block displays a hero image. It behaves like an \'section\' with a single \'column\'.',
          );
        },
        component: HeroBlockItem,
      },
      {
        type: AdvancedType.NAVBAR,
        get title() {
          return t`导航栏`;
        },
        get description() {
          return translate(
            'Displays a menu for navigation with an optional hamburger mode for mobile devices.',
          );
        },
        component: NavbarBlockItem,
      },
      {
        type: AdvancedType.SPACER,
        get title() {
          return t`间隔`;
        },
        get description() {
          return t`显示空白间隔。`;
        },
        component: SpacerBlockItem,
      },
      {
        type: AdvancedType.DIVIDER,
        get title() {
          return t`分隔线`;
        },
        get description() {
          return translate(
            'Displays a horizontal divider that can be customized like a HTML border.',
          );
        },
        component: DividerBlockItem,
      },
      {
        type: AdvancedType.ACCORDION,
        get title() {
          return t`折叠面板`;
        },
        get description() {
          return translate(
            'Accordion is an interactive component to stack content in tabs, so the information is collapsed and only the titles are visible. Readers can interact by clicking on the tabs to reveal the content, providing a great experience on mobile devices where space is scarce.',
          );
        },
        component: AccordionBlockItem,
      },
      {
        type: AdvancedType.CAROUSEL,
        get title() {
          return t`轮播图`;
        },
        get description() {
          return translate(
            'This block displays a gallery of images or \'carousel\'. Readers can interact by hovering and clicking on thumbnails depending on the email client they use.',
          );
        },
        component: CarouselBlockItem,
      },
      {
        type: AdvancedType.SOCIAL,
        get title() {
          return t`社交媒体`;
        },
        get description() {
          return translate(
            'Displays calls-to-action for various social networks with their associated logo.',
          );
        },
        component: SocialBlockItem,
      },
      {
        type: AdvancedType.TABLE,
        get title() {
          return t`表格`;
        },
        get description() {
          return t`用于在邮件中展示表格内容，支持单元格编辑与行列操作。`;
        },
        component: TableBlockItem,
      },
    ],
  },
  {
    get title() {
      return t`布局`;
    },
    name: 'LAYOUT',
    blocks: [
      {
        type: AdvancedType.SECTION,
        get title() {
          return t`行`;
        },
        get description() {
          return (
            <Stack
              vertical
              spacing='none'
            >
              <TextStyle>
                {translate(
                  'Sections are intended to be used as rows within your email. They will be used to structure the layout.',
                )}
              </TextStyle>
              <TextStyle>
                {translate(
                  'Sections cannot nest in sections. Columns can nest in sections; all content must be in a column.',
                )}
              </TextStyle>
            </Stack>
          );
        },
        component: SectionBlockItem,
      },
      {
        type: AdvancedType.GROUP,
        get title() {
          return t`分组`;
        },
        get description() {
          return translate(
            'Group allows you to prevent columns from stacking on mobile. To do so, wrap the columns inside a group block, so they"ll stay side by side on mobile.',
          );
        },
        component: GroupBlockItem,
      },
      {
        type: AdvancedType.COLUMN,
        get title() {
          return t`列`;
        },
        get description() {
          return (
            <Stack
              vertical
              spacing='none'
            >
              <TextStyle>
                {translate(`Columns enable you to horizontally organize the content within
                your sections. They must be located under "Section" block in order
                to be considered by the engine. To be responsive, columns are
                expressed in terms of percentage.`)}
              </TextStyle>
              <TextStyle>
                {t`Every single column has to contain something because they are
                responsive containers, and will be vertically stacked on a mobile
                view.`}
              </TextStyle>
            </Stack>
          );
        },
        component: ColumnBlockItem,
      },
    ],
  },
];
