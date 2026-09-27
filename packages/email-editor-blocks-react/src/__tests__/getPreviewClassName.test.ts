import { BasicType, getChildIdx, getPageIdx } from '@wa-dev/email-editor-shared';
import { getPreviewClassName } from '../utils/getPreviewClassName';

describe('Test getPreviewClassName.test', () => {
  it("should get result as expected", () => {
    const idx = getChildIdx(getPageIdx(), 0);
    const className = getPreviewClassName(idx, BasicType.SECTION);
    expect(className).toEqual(`email-block node-idx-${idx} node-type-${BasicType.SECTION}`);

  });

});
