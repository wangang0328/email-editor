import { getBlockByType } from '../blockRegistry';
import { BasicType } from '@wa-dev/email-editor-shared';
import { createBlockDataByType } from '../createBlockDataByType';

describe('Test createBlockItem', () => {
  it('should render as expected', () => {
    expect(createBlockDataByType(BasicType.TEXT)).toEqual(
      getBlockByType(BasicType.TEXT)!.create()
    );
  });
});
