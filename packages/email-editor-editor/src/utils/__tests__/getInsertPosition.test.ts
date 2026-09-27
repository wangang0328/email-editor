import { describe, expect, it } from 'vitest';
import { BasicType } from '@wa-dev/email-editor-blocks-react';
import { getInsertPosition } from '../getInsertPosition';
import type { DirectionPosition } from '../getDirectionPosition';

function dir(vertical: 'top' | 'bottom', horizontal: 'left' | 'right' = 'left'): DirectionPosition {
  return {
    vertical: { direction: vertical, isEdge: false },
    horizontal: { direction: horizontal, isEdge: false },
  };
}

const context = {
  content: {
    type: BasicType.PAGE,
    children: [
      {
        type: BasicType.SECTION,
        children: [{ type: BasicType.COLUMN, children: [{ type: BasicType.TEXT }] }],
      },
      {
        type: BasicType.WRAPPER,
        children: [
          {
            type: BasicType.SECTION,
            children: [
              {
                type: BasicType.COLUMN,
                children: [{ type: BasicType.TEXT }],
              },
            ],
          },
          {
            type: BasicType.SECTION,
            children: [
              {
                type: BasicType.COLUMN,
                children: [{ type: BasicType.TEXT }],
              },
            ],
          },
        ],
      },
      {
        type: BasicType.SECTION,
        children: [{ type: BasicType.COLUMN, children: [] }],
      },
    ],
  },
} as any;

describe('getInsertPosition move', () => {
  it('keeps wrapper reorder inside page siblings, not inner section', () => {
    const result = getInsertPosition({
      context,
      idx: 'content.children.[1].children.[0]',
      sourceIdx: 'content.children.[1]',
      dragType: BasicType.WRAPPER,
      directionPosition: dir('bottom'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content');
    expect(result?.insertIndex).toBe(2);
  });

  it('reorders sections inside wrapper', () => {
    const result = getInsertPosition({
      context,
      idx: 'content.children.[1].children.[0]',
      sourceIdx: 'content.children.[1].children.[1]',
      dragType: BasicType.SECTION,
      directionPosition: dir('top'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[1]');
    expect(result?.insertIndex).toBe(0);
  });

  it('moves text between columns inside wrapper', () => {
    const result = getInsertPosition({
      context,
      idx: 'content.children.[1].children.[1].children.[0].children.[0]',
      sourceIdx: 'content.children.[1].children.[0].children.[0].children.[0]',
      dragType: BasicType.TEXT,
      directionPosition: dir('top'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[1].children.[1].children.[0]');
    expect(result?.insertIndex).toBe(0);
  });

  it('moves text back to original column without page-level insert', () => {
    const result = getInsertPosition({
      context,
      idx: 'content.children.[1].children.[0].children.[0].children.[0]',
      sourceIdx: 'content.children.[1].children.[1].children.[0].children.[0]',
      dragType: BasicType.TEXT,
      directionPosition: dir('bottom'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[1].children.[0].children.[0]');
    expect(result?.insertIndex).toBe(1);
  });

  it('allows text outside wrapper to drop into wrapper column via section hover', () => {
    const outsideContext = {
      content: {
        type: BasicType.PAGE,
        children: [
          {
            type: BasicType.WRAPPER,
            children: [
              {
                type: BasicType.SECTION,
                children: [
                  {
                    type: BasicType.COLUMN,
                    children: [{ type: BasicType.TEXT }],
                  },
                ],
              },
            ],
          },
          {
            type: BasicType.SECTION,
            children: [
              {
                type: BasicType.COLUMN,
                children: [{ type: BasicType.TEXT }, { type: BasicType.TEXT }],
              },
            ],
          },
        ],
      },
    } as any;

    const result = getInsertPosition({
      context: outsideContext,
      idx: 'content.children.[0].children.[0]',
      sourceIdx: 'content.children.[1].children.[0].children.[1]',
      dragType: BasicType.TEXT,
      directionPosition: dir('top'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[0].children.[0].children.[0]');
    expect(result?.insertIndex).toBe(0);
  });

  it('allows text outside wrapper to drop when hovering column directly', () => {
    const outsideContext = {
      content: {
        type: BasicType.PAGE,
        children: [
          {
            type: BasicType.WRAPPER,
            children: [
              {
                type: BasicType.SECTION,
                children: [
                  {
                    type: BasicType.COLUMN,
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            type: BasicType.SECTION,
            children: [
              {
                type: BasicType.COLUMN,
                children: [{ type: BasicType.TEXT }],
              },
            ],
          },
        ],
      },
    } as any;

    const result = getInsertPosition({
      context: outsideContext,
      idx: 'content.children.[0].children.[0].children.[0]',
      sourceIdx: 'content.children.[1].children.[0].children.[0]',
      dragType: BasicType.TEXT,
      directionPosition: dir('bottom'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[0].children.[0].children.[0]');
    expect(result?.insertIndex).toBe(0);
  });

  it('moves text downward to next sibling in same column', () => {
    const columnContext = {
      content: {
        type: BasicType.PAGE,
        children: [
          {
            type: BasicType.SECTION,
            children: [
              {
                type: BasicType.COLUMN,
                children: [
                  { type: BasicType.TEXT },
                  { type: BasicType.TEXT },
                  { type: BasicType.TEXT },
                ],
              },
            ],
          },
        ],
      },
    } as any;

    const result = getInsertPosition({
      context: columnContext,
      idx: 'content.children.[0].children.[0].children.[1]',
      sourceIdx: 'content.children.[0].children.[0].children.[0]',
      dragType: BasicType.TEXT,
      directionPosition: dir('bottom'),
      action: 'move',
    });

    expect(result?.parentIdx).toBe('content.children.[0].children.[0]');
    expect(result?.insertIndex).toBe(2);
  });
});
