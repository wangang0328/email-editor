import {
  Select,
  EDITOR_CLASS,
  cn,
} from '@wa-dev/email-editor-ui';
import React, { useMemo } from 'react';
import { parseFontFamilyValue } from '@panels/shared/fontFamilyOptions';
import enhancer from './enhancer';

export interface MultiSelectProps {
  value?: string[];
  onChange?: (val: string[]) => void;
  options: Array<{ value: string; label: React.ReactNode }>;
  placeholder?: string;
  style?: React.CSSProperties;
  maxTagCount?: number;
}

export interface MultiSelectStringProps extends Omit<MultiSelectProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (val: string) => void;
}

function MultiSelectStringAdapter({
  value,
  onChange,
  ...rest
}: MultiSelectStringProps) {
  const selected = useMemo(() => parseFontFamilyValue(value), [value]);

  return (
    <MultiSelect
      {...rest}
      value={selected}
      onChange={arr => onChange?.(arr.join(', '))}
    />
  );
}

export const MultiSelectStringField = enhancer<MultiSelectStringProps>(
  MultiSelectStringAdapter,
  e => e,
);

export function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder,
  style,
  maxTagCount = 2,
}: MultiSelectProps) {
  return (
    <Select
      mode="multiple"
      className={cn(EDITOR_CLASS.selectTrigger, 'ee-multi-select')}
      value={value}
      options={options}
      placeholder={placeholder}
      style={style}
      maxTagCount={maxTagCount}
      allowClear
      onChange={val => onChange?.(val as string[])}
    />
  );
}
