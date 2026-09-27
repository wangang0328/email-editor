import { BasicType, AdvancedType } from '@wa-dev/email-editor-shared/types';
import { pixelAdapter } from '../pixel.adapter';
import { borderWidthAdapter } from '../borderWidth.adapter';
import { imageHeightAdapter } from '../image-height.adapter';
import { sliderAdapter } from '../slider.adapter';
import { colorAdapter } from '../color.adapter';

describe('pixelAdapter', () => {
  it('format strips px suffix', () => {
    expect(pixelAdapter.format('12px')).toBe('12');
  });

  it('format keeps non-px strings', () => {
    expect(pixelAdapter.format('auto')).toBe('auto');
  });

  it('parse adds px for numeric strings', () => {
    expect(pixelAdapter.parse('12')).toBe('12px');
    expect(pixelAdapter.parse(12)).toBe('12px');
  });

  it('parse returns undefined for empty', () => {
    expect(pixelAdapter.parse('')).toBeUndefined();
    expect(pixelAdapter.parse('   ')).toBeUndefined();
  });
});

describe('borderWidthAdapter', () => {
  it('parse appends px for bare numbers', () => {
    expect(borderWidthAdapter.parse('2')).toBe('2px');
    expect(borderWidthAdapter.parse('1.5')).toBe('1.5px');
  });

  it('parse keeps valid width units', () => {
    expect(borderWidthAdapter.parse('2px')).toBe('2px');
    expect(borderWidthAdapter.parse('50%')).toBe('50%');
  });
});

describe('imageHeightAdapter', () => {
  it('format maps auto to undefined', () => {
    expect(imageHeightAdapter.format('auto')).toBeUndefined();
  });

  it('format strips px', () => {
    expect(imageHeightAdapter.format('100px')).toBe('100');
  });

  it('parse adds px for digits', () => {
    expect(imageHeightAdapter.parse('100')).toBe('100px');
  });
});

describe('sliderAdapter', () => {
  it('format parses px to number', () => {
    expect(sliderAdapter.format('24px')).toBe(24);
  });

  it('parse adds px for numeric values', () => {
    expect(sliderAdapter.parse(16 as unknown as string)).toBe('16px');
  });

  it('parse rejects numeric strings (lodash isNumber)', () => {
    expect(sliderAdapter.parse('16')).toBeUndefined();
  });
});

describe('colorAdapter', () => {
  it('format strips leading hash for hex7', () => {
    expect(colorAdapter.format('#ff0000')).toBe('ff0000');
  });

  it('parse restores hash for 6-char hex', () => {
    expect(colorAdapter.parse('00ff00')).toBe('#00ff00');
  });
});

// keep BasicType import exercised so registry types stay linked to shared
describe('shared block type constants', () => {
  it('exposes page / advanced text', () => {
    expect(BasicType.PAGE).toBeTruthy();
    expect(AdvancedType.TEXT).toBeTruthy();
  });
});
