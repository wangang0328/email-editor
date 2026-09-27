import {
  AdvancedType,
  BasicType,
  ensureDefaultEngineBlocks,
  getSameParent,
} from '@wa-dev/email-editor-blocks-react';
import { getInsertPosition } from '../getInsertPosition';

ensureDefaultEngineBlocks();

function dir(
  vertical: 'top' | 'bottom',
  horizontal: 'left' | 'right' = 'left',
) {
  return {
    vertical: { direction: vertical, isEdge: false },
    horizontal: { direction: horizontal, isEdge: false },
  };
}

const advancedColumnContext = {
  content: {
    type: BasicType.PAGE,
    children: [
      {
        type: AdvancedType.SECTION,
        children: [
          {
            type: AdvancedType.COLUMN,
            children: [{ type: AdvancedType.TEXT }],
          },
        ],
      },
    ],
  },
} as any;

describe('table insert into advanced_column', () => {
  it('getSameParent keeps advanced_table under advanced_column (not page)', () => {
    const textIdx =
      'content.children.[0].children.[0].children.[0]';
    const same = getSameParent(
      advancedColumnContext,
      textIdx,
      AdvancedType.TABLE,
    );

    expect(same?.parentIdx).toBe('content.children.[0].children.[0]');
    expect(same?.parent.type).toBe(AdvancedType.COLUMN);
  });

  it('getInsertPosition adds advanced_table into the hovered column', () => {
    const textIdx =
      'content.children.[0].children.[0].children.[0]';
    const result = getInsertPosition({
      context: advancedColumnContext,
      idx: textIdx,
      dragType: AdvancedType.TABLE,
      directionPosition: dir('bottom'),
      action: 'add',
    });

    expect(result?.parentIdx).toBe('content.children.[0].children.[0]');
    expect(result?.insertIndex).toBe(1);
  });

  it('advanced_text still inserts into the same column (control)', () => {
    const textIdx =
      'content.children.[0].children.[0].children.[0]';
    const result = getInsertPosition({
      context: advancedColumnContext,
      idx: textIdx,
      dragType: AdvancedType.TEXT,
      directionPosition: dir('bottom'),
      action: 'add',
    });

    expect(result?.parentIdx).toBe('content.children.[0].children.[0]');
    expect(result?.insertIndex).toBe(1);
  });
});
