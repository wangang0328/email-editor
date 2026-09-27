import { isNumber, InputNumberAdapter } from '../InputNumberAdapter';

describe('isNumber', () => {
  it('accepts numeric strings and numbers', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber('12.5')).toBe(true);
    expect(isNumber('-3')).toBe(true);
  });

  it('rejects non-numeric values', () => {
    expect(isNumber('abc')).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
  });
});

describe('InputNumberAdapter', () => {
  it('coerces numeric strings to number', () => {
    expect(InputNumberAdapter('10')).toBe(10);
  });

  it('keeps non-numeric strings', () => {
    expect(InputNumberAdapter('auto')).toBe('auto');
  });
});
