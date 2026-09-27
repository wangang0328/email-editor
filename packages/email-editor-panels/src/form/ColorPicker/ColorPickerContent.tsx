import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import Color from 'color';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PresetColorsContext } from '@panels/provider/PresetColorsProvider';
import styles from './color-picker.module.scss';

export interface ColorPickerContentProps {
  onChange: (val: string) => void;
  value: string;
}

const transparentColor = 'rgba(0,0,0,0)';

function normalizeHex(value: string): string {
  if (!value || value === transparentColor) return '#000000';
  try {
    return Color(value).hex();
  } catch {
    return '#000000';
  }
}

export function ColorPickerContent(props: ColorPickerContentProps) {
  const { colors: presetColors } = useContext(PresetColorsContext);
  const { onChange } = props;
  const [color, setColor] = useState(() => normalizeHex(props.value));

  useEffect(() => {
    setColor(normalizeHex(props.value));
  }, [props.value]);

  const presetColorList = useMemo(() => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const item of presetColors.filter(c => c !== transparentColor).slice(-21)) {
      const hex = normalizeHex(item);
      const key = hex.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(hex);
      }
    }
    return unique;
  }, [presetColors]);

  const applyColor = useMemoizedFn((next: string) => {
    const hex = normalizeHex(next);
    setColor(hex);
    onChange(hex);
  });

  return (
    <div className={styles.panel}>
      <div className={styles.pickerWrap}>
        <HexColorPicker color={color} onChange={applyColor} />
      </div>

      {presetColorList.length > 0 ? (
        <div className={styles.presets}>
          <div className={styles.presetsLabel}>{t`预设颜色`}</div>
          <div className={styles.presetGrid}>
            {presetColorList.map(itemHex => {
              const isActive = itemHex.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={itemHex}
                  type="button"
                  title={itemHex}
                  className={`${styles.presetSwatch} ${isActive ? styles.presetSwatchActive : ''}`}
                  style={{ backgroundColor: itemHex }}
                  onClick={() => applyColor(itemHex)}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
