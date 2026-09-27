import { describe, expect, it } from 'vitest';
import { AdvancedType, BasicType } from '@wa-dev/email-editor-blocks-react';
import { resolveMoveSource } from '../resolveMoveSource';

describe('resolveMoveSource', () => {
  it('elevates to wrapper when direct parent is wrapper', () => {
    const values = {
      content: {
        type: BasicType.PAGE,
        data: { value: {} },
        attributes: {},
        children: [
          {
            type: BasicType.WRAPPER,
            data: { value: {} },
            attributes: {},
            children: [
              {
                type: BasicType.SECTION,
                data: { value: {} },
                attributes: {},
                children: [],
              },
            ],
          },
        ],
      },
    };

    expect(
      resolveMoveSource(
        values,
        'content.children.[0].children.[0]',
        BasicType.SECTION,
      ),
    ).toEqual({
      idx: 'content.children.[0]',
      type: BasicType.WRAPPER,
    });
  });

  it('elevates to advanced_wrapper when direct parent is advanced wrapper', () => {
    const values = {
      content: {
        type: BasicType.PAGE,
        data: { value: {} },
        attributes: {},
        children: [
          {
            type: AdvancedType.WRAPPER,
            data: { value: {} },
            attributes: {},
            children: [
              {
                type: AdvancedType.SECTION,
                data: { value: {} },
                attributes: {},
                children: [],
              },
            ],
          },
        ],
      },
    };

    expect(
      resolveMoveSource(
        values,
        'content.children.[0].children.[0]',
        AdvancedType.SECTION,
      ),
    ).toEqual({
      idx: 'content.children.[0]',
      type: AdvancedType.WRAPPER,
    });
  });

  it('keeps focus when already a wrapper', () => {
    const values = {
      content: {
        type: BasicType.PAGE,
        data: { value: {} },
        attributes: {},
        children: [
          {
            type: BasicType.WRAPPER,
            data: { value: {} },
            attributes: {},
            children: [],
          },
        ],
      },
    };

    expect(
      resolveMoveSource(values, 'content.children.[0]', BasicType.WRAPPER),
    ).toEqual({
      idx: 'content.children.[0]',
      type: BasicType.WRAPPER,
    });
  });

  it('keeps focus when parent is not wrapper', () => {
    const values = {
      content: {
        type: BasicType.PAGE,
        data: { value: {} },
        attributes: {},
        children: [
          {
            type: BasicType.SECTION,
            data: { value: {} },
            attributes: {},
            children: [
              {
                type: BasicType.COLUMN,
                data: { value: {} },
                attributes: {},
                children: [
                  {
                    type: BasicType.TEXT,
                    data: { value: {} },
                    attributes: {},
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    expect(
      resolveMoveSource(
        values,
        'content.children.[0].children.[0].children.[0]',
        BasicType.TEXT,
      ),
    ).toEqual({
      idx: 'content.children.[0].children.[0].children.[0]',
      type: BasicType.TEXT,
    });
  });
});
