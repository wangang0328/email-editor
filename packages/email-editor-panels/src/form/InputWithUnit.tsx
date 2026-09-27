import type { InputProps as ArcoInputProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo } from 'react';
import { Input } from './Input';
import { Select } from './Select';

export interface InputWithUnitProps extends Omit<ArcoInputProps, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  unitOptions?: Array<{ value: string; label: string }> | 'default' | 'percent' | 'lineHeight';
  quickchange?: boolean;
  /** Shown after the input (e.g. unit `px`); value still uses `config` parse/format */
  suffix?: React.ReactNode;
}

const percentUnitOptions = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
];

export const lineHeightUnitOptions = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
];

function resolveUnitOptions(unitOptions?: InputWithUnitProps['unitOptions']) {
  if (!unitOptions || unitOptions === 'default') return null;
  if (unitOptions === 'percent') return percentUnitOptions;
  if (unitOptions === 'lineHeight') return lineHeightUnitOptions;
  if (Array.isArray(unitOptions)) return unitOptions;
  return null;
}

function parseValueWithUnit(value: string, units: string[]) {
  const trimmed = (value ?? '').toString().trim();
  if (!trimmed) return { number: '', unit: '' };

  const sortedUnits = [...units].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const unit of sortedUnits) {
    if (trimmed.endsWith(unit)) {
      return { number: trimmed.slice(0, -unit.length).trim(), unit };
    }
  }

  return { number: trimmed, unit: '' };
}

function formatValueWithUnit(number: string, unit: string) {
  const n = number.trim();
  if (!n) return '';
  return unit ? `${n}${unit}` : n;
}

export function InputWithUnit(props: InputWithUnitProps) {
  const {
    value = '',
    onKeyDown: onPropsKeyDown,
    unitOptions: propsUnitOptions,
    suffix,
    onChange,
    quickchange = true,
    type,
    ...restProps
  } = props;

  const options = resolveUnitOptions(propsUnitOptions);
  const unitValues = useMemo(() => options?.map(option => option.value) ?? [], [options]);

  const { number, unit } = useMemo(
    () => parseValueWithUnit(value, unitValues),
    [value, unitValues],
  );

  const onNumberChange = useMemoizedFn((val: string) => {
    onChange(formatValueWithUnit(val, unit));
  });

  const onUnitChange = useMemoizedFn((nextUnit: string) => {
    onChange(formatValueWithUnit(number, nextUnit));
  });

  if (!options) {
    return (
      <Input
        value={value}
        onChange={onChange}
        {...restProps}
        suffix={suffix}
        quickchange={quickchange}
        type={type}
        onKeyDown={onPropsKeyDown}
      />
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-0 flex-1">
        <Input
          value={number}
          onChange={onNumberChange}
          {...restProps}
          quickchange={quickchange}
          type={type ?? 'number'}
          onKeyDown={onPropsKeyDown}
        />
      </div>
      <Select
        value={unit}
        onChange={onUnitChange}
        options={options}
        style={{ width: 72, flexShrink: 0 }}
      />
    </div>
  );
}
