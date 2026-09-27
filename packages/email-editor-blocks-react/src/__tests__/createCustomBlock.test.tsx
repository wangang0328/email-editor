import { getBlockByType, registerBlocks } from '../blockRegistry';
import { BasicType } from '@wa-dev/email-editor-shared';
import { createCustomBlock } from '../utils/createCustomBlock';
import { merge } from 'lodash-es';
import MjmlBlock from '../mjml/MjmlBlock';
import type { IBlockData } from '../typings';
import React from 'react';
import { JsonToMjml } from '../JsonToMjml';

type IMyFirstBlock = IBlockData<
  {
    'background-color': string;
    'text-color': string;
  },
  {
    buttonText: string;
    imageUrl: string;
  }
>;

const myFirstBlock = createCustomBlock({
  name: 'My first block',
  type: 'MY_FIRST_BLOCK',
  create(payload) {
    const defaultData: IMyFirstBlock = {
      type: 'MY_FIRST_BLOCK',
      data: {
        value: {
          buttonText: 'Got it',
          imageUrl:
            'https://assets.maocanhua.cn/10dada65-c4fb-4b1f-837e-59a1005bbea6-image.png',
        },
      },
      attributes: {
        'background-color': '#4A90E2',
        'text-color': '#ffffff',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE, BasicType.WRAPPER],
  render({ data }) {
    const { imageUrl, buttonText } = data.data.value;
    const attributes = data.attributes;

    const instance = (
      <MjmlBlock type={BasicType.SECTION} padding='20px'>
        <MjmlBlock type={BasicType.COLUMN}>
          <MjmlBlock
            type={BasicType.IMAGE}
            padding='0px 0px 0px 0px'
            width='100px'
            src={imageUrl}
          />
          <MjmlBlock
            type={BasicType.BUTTON}
            background-color={attributes['background-color']}
            color={attributes['text-color']}
            href='#'
          >
            {buttonText}
          </MjmlBlock>
        </MjmlBlock>
      </MjmlBlock>
    );
    return instance;
  },
});

describe('Test createCustomBlock', () => {
  registerBlocks({ ['MY_FIRST_BLOCK']: myFirstBlock });

  const pageBlock = getBlockByType(BasicType.PAGE)!;

  it('should render as expected', () => {
    expect(
      JsonToMjml({
        data: pageBlock.create({
          children: [myFirstBlock.create()],
        }),
        mode: 'production',
      })
    ).toMatchSnapshot();
  });
});
