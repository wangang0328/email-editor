## Custom block

> **Note:** Legacy `components.Section` / `components.Button` (from removed `mjml/jsx`) are replaced by **`MjmlBlock`** from `@wa-dev/email-editor-blocks-react`. Pass MJML attributes as props (`padding`, `href`, …) or via `attributes={{ ... }}`.

What is a custom block？Custom block is composed of one or more basic blocks.

This is a Section block with its children

```tsx
import MjmlBlock, { BasicType } from '@wa-dev/email-editor-blocks-react';

<MjmlBlock type={BasicType.SECTION}>
  <MjmlBlock type={BasicType.COLUMN}>
    <MjmlBlock type={BasicType.TEXT}>hello</MjmlBlock>
  </MjmlBlock>
</MjmlBlock>
```

But we can also encapsulate it and call it Custom Section block.

```tsx
(<CustomSection></CustomSection>).isEqual(
  <MjmlBlock type={BasicType.SECTION}>
    <MjmlBlock type={BasicType.COLUMN}>
      <MjmlBlock type={BasicType.TEXT}>hello</MjmlBlock>
    </MjmlBlock>
  </MjmlBlock>,
);
```

There is such a conversion rule

`IBlockData<T>` => `transformToMjml`=> `mjml-component<T>`

- transformToMjml(`IText`) === `<mj-text>xxx</mj-text>`
- transformToMjml(`ISection`) === `<mj-section>xxx</mj-section>`

And it can be reversed

- `<mj-text>xxx</mj-text>` => `MjmlToJson` => `IText`

### Write a custom block

A custom block should have the following structure

```ts
{
  name: string; // block name
  type: BlockType; // Custom type
  validParentType: BlockType[]; // Only drag to the above blocks. For example, `Text` only drag to `Colum` block and `Hero` block.
  create: (payload?: RecursivePartial<T extends IBlockData>) => T;
  render?: (
      data: IBlockData<T>, // current block data
      idx: string | null,  // current idx
      mode: 'testing' | 'production', // you can return different
      context?: IPage,
      dataSource?: { [key: string]: any } // data source from JsonToMjml

  ) => IBlockData;
}

```

`create` is a method of instance generation, Let’s say `Text`, when dragging and dropped into the edit panel and , we will call `addBlock`. In fact, it just calls the corresponding `create` and generate blockData.

```ts
const create: CreateInstance<IText> = payload => {
  const defaultData: IText = {
    type: BasicType.TEXT,
    data: {
      value: {
        content: 'Make it easy for everyone to compose emails!',
      },
    },
    attributes: {
      'font-size': '13px',
      padding: '10px 25px 10px 25px',
      'line-height': 1,
      align: 'left',
    },
    children: [],
  };
  return merge(defaultData, payload);
};
```

`render` mainly to render your custom block into one or more basic block. When `JsonToMjml` is called, if it is found to be an custom block, we will call its `render` method to convert it into basic blocks.

You can construct your custom block through basic blocks. For example,
a custom button, only the background color and text can be modified

```tsx
import MjmlBlock, { BasicType, getPreviewClassName } from '@wa-dev/email-editor-blocks-react';

const render = (data: ICustomButton, idx: string, mode: 'testing' | 'production') => {
  const attributes = data.attributes;
  const { buttonText } = data.data.value;

  return (
    <MjmlBlock
      type={BasicType.BUTTON}
      background-color={attributes['background-color']}
      css-class={mode === 'testing' ? getPreviewClassName(idx, data.type) : ''}
    >
      {buttonText}
    </MjmlBlock>
  );
};
```

Another way is that you can write [MJML](https://documentation.mjml.io/).

```ts
import {
  IBlockData,
  BasicType,
  BlockRenderer,
  createCustomBlock,
  getPreviewClassName,
  AdvancedType,
} from '@wa-dev/email-editor-blocks-react';
import { MjmlToJson } from '@wa-dev/email-editor-preset';

const render = (
  data: ICustomButton,
  idx: string,
  mode: 'testing' | 'production',
  context?: IPage,
  dataSource?: { [key: string]: any },
) => {
  const attributes = data.attributes;
  const { buttonText } = data.data.value;

  const instance = MjmlToJson(
    `<mj-button background-color==${attributes['background-color']}  css-class="${
      mode === 'testing' ? getPreviewClassName(idx, data.type) : ''
    }">${buttonText}</mj-button>`,
  ) as IBlockData;

  return <BlockRenderer data={instance} />;
};
```

### Register this block

Only after registering this block, mjml-parser can convert it into basic blocks

```ts
import { BlocksMap } from '@wa-dev/email-editor-editor';

BlocksMap.registerBlocks({ 'block-name': YourCustomBlock });
```

### View demo

[https://github.com/m-Ryan/easy-email-demo/tree/main/src/CustomBlocks](https://github.com/m-Ryan/easy-email-demo/tree/main/src/CustomBlocks)

<br/>
<br/>

## Dynamic rendering

```tsx
import MjmlBlock, {
  IBlockData,
  BasicType,
  createCustomBlock,
} from '@wa-dev/email-editor-blocks-react';

import { CustomBlocksType } from '../constants';
import React from 'react';
import { merge } from 'lodash';

export type IProductRecommendation = IBlockData<
  {
    'background-color': string;
    'button-color': string;
    'button-text-color': string;
    'product-name-color': string;
    'product-price-color': string;
    'title-color': string;
  },
  {
    title: string;
    buttonText: string;
    quantity: number;
  }
>;

const productPlaceholder = {
  image:
    'http://res.cloudinary.com/dwkp0e1yo/image/upload/v1665756285/rayk1n0lxm6vk1aqkgah.png',
  title: 'Red Flock Buckle Winter Boots',
  price: '$59.99 HKD',
  url: 'https://easy-email-m-ryan.vercel.app',
};

export const ProductRecommendation = createCustomBlock<IProductRecommendation>({
  name: 'Product recommendation',
  type: CustomBlocksType.PRODUCT_RECOMMENDATION,
  validParentType: [BasicType.PAGE],
  create: payload => {
    const defaultData: IProductRecommendation = {
      type: CustomBlocksType.PRODUCT_RECOMMENDATION,
      data: {
        value: {
          title: 'You might also like',
          buttonText: 'Buy now',
          quantity: 3,
        },
      },
      attributes: {
        'background-color': '#ffffff',
        'button-text-color': '#ffffff',
        'button-color': '#414141',
        'product-name-color': '#414141',
        'product-price-color': '#414141',
        'title-color': '#222222',
      },
      children: [
        {
          type: BasicType.TEXT,
          children: [],
          data: {
            value: {
              content: 'custom block title',
            },
          },
          attributes: {},
        },
      ],
    };
    return merge(defaultData, payload);
  },
  render: (data, idx, mode, context, dataSource) => {
    const { title, buttonText, quantity } = data.data.value;
    const attributes = data.attributes;

    const productList =
      mode === 'testing'
        ? new Array(quantity).fill(productPlaceholder)
        : (dataSource?.product_list || []).slice(0, quantity);

    const perWidth = quantity <= 3 ? '' : '33.33%';

    return (
      <MjmlBlock
        type={BasicType.WRAPPER}
        padding='20px 0px 20px 0px'
        border='none'
        direction='ltr'
        text-align='center'
        background-color={attributes['background-color']}
      >
        <MjmlBlock type={BasicType.SECTION} padding='0px'>
          <MjmlBlock
            type={BasicType.COLUMN}
            padding='0px'
            border='none'
            vertical-align='top'
          >
            <MjmlBlock
              type={BasicType.TEXT}
              font-size='20px'
              padding='10px 25px 10px 25px'
              line-height='1'
              align='center'
              font-weight='bold'
              color={attributes['title-color']}
            >
              {title}
            </MjmlBlock>
          </MjmlBlock>
        </MjmlBlock>

        <MjmlBlock type={BasicType.SECTION} padding='0px'>
          <MjmlBlock
            type={BasicType.GROUP}
            vertical-align='top'
            direction='ltr'
          >
            {productList.map((item, index) => (
              <MjmlBlock
                key={index}
                type={BasicType.COLUMN}
                width={perWidth}
                padding='0px'
                border='none'
                vertical-align='top'
              >
                <MjmlBlock
                  type={BasicType.IMAGE}
                  align='center'
                  height='auto'
                  padding='10px'
                  width='150px'
                  src={item.image}
                />
                <MjmlBlock
                  type={BasicType.TEXT}
                  font-size='12px'
                  padding='10px 0px 10px 0px '
                  line-height='1'
                  align='center'
                  color={attributes['product-name-color']}
                >
                  {item.title}
                </MjmlBlock>
                <MjmlBlock
                  type={BasicType.TEXT}
                  font-size='12px'
                  padding='0px'
                  line-height='1'
                  align='center'
                  color={attributes['product-price-color']}
                >
                  {item.price}
                </MjmlBlock>
                <MjmlBlock
                  type={BasicType.BUTTON}
                  align='center'
                  padding='15px 0px'
                  background-color={attributes['button-color']}
                  color={attributes['button-text-color']}
                  target='_blank'
                  vertical-align='middle'
                  border='none'
                  text-align='center'
                  href={item.url}
                >
                  {buttonText}
                </MjmlBlock>
              </MjmlBlock>
            ))}
          </MjmlBlock>
        </MjmlBlock>
      </MjmlBlock>
    );
  },
});

export { Panel } from './Panel';
```
