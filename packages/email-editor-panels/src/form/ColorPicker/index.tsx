import { Input, Popover } from '@wa-dev/email-editor-ui';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { cn } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import Color from 'color';
import React, { useContext, useMemo, useState } from 'react';
import { getImg } from '@panels/utils/getImg';
import { PresetColorsContext } from '@panels/provider/PresetColorsProvider';
import { ColorPickerContent } from './ColorPickerContent';
import styles from './color-picker.module.scss';

export interface ColorPickerProps extends Omit<PopoverProps, 'content'> {
  onChange?: (val: string) => void;
  value?: string;
  label: string;
  children?: React.ReactNode;
  showInput?: boolean;
  fixed?: boolean;
}

const transparentColor = 'rgba(0,0,0,0)';

function normalizeHex(value: string): string {
  if (!value || value === transparentColor) return '';
  try {
    return Color(value).hex().replace('#', '').toUpperCase();
  } catch {
    return value.replace(/^#/, '').toUpperCase();
  }
}

function toOutputHex(input: string): string {
  const raw = input.replace(/^#/, '').trim();
  if (!raw) return transparentColor;
  if (/^[0-9a-fA-F]{3}$/.test(raw) || /^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  try {
    return Color(input).hex();
  } catch {
    return input.startsWith('#') ? input : `#${raw}`;
  }
}

export function ColorPicker(props: ColorPickerProps) {
  const { addCurrentColor } = useContext(PresetColorsContext);
  const rawValue = props.value;
  const valueStr = rawValue == null ? '' : String(rawValue);
  const {
    onChange,
    showInput = true,
    position = 'bl',
    className,
    onVisibleChange,
  } = props;
  const [open, setOpen] = useState(false);

  const handleVisibleChange = useMemoizedFn((visible: boolean) => {
    setOpen(visible);
    onVisibleChange?.(visible);
  });

  const isTransparent = !valueStr || valueStr === transparentColor;

  const displayHex = useMemo(() => normalizeHex(valueStr), [valueStr]);

  const swatchColor = useMemo(() => {
    if (isTransparent) return undefined;
    try {
      return Color(valueStr).hex();
    } catch {
      return valueStr.startsWith('#') ? valueStr : `#${valueStr}`;
    }
  }, [isTransparent, valueStr]);

  const onColorChange = useMemoizedFn((next: string) => {
    onChange?.(next);
    addCurrentColor(next);
  });

  const onInputChange = useMemoizedFn((next: string) => {
    onColorChange(toOutputHex(next));
  });

  const getPopupContainer = useMemoizedFn(
    () => props.getPopupContainer?.() ?? document.body,
  );

  const popoverClassName = cn('color-picker-popup z-[1050]', className);

  const popoverContent = (
    <ColorPickerContent value={swatchColor || '#000000'} onChange={onColorChange} />
  );

  const swatchTrigger = (
    <button
      type="button"
      className={styles.swatchBtn}
      aria-label={props.label}
    >
      <span
        className={`${styles.swatchInner} ${isTransparent ? styles.swatchTransparent : ''}`}
        style={swatchColor ? { backgroundColor: swatchColor } : undefined}
      >
        {isTransparent ? (
          <img
            alt=""
            src={getImg('TRANSPARENT_ICON')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.55,
            }}
          />
        ) : null}
      </span>
    </button>
  );

  if (!showInput) {
    return (
      <Popover
        trigger="click"
        position={position}
        popupVisible={open}
        onVisibleChange={handleVisibleChange}
        content={popoverContent}
        getPopupContainer={getPopupContainer}
        className={popoverClassName}
      >
        {props.children || swatchTrigger}
      </Popover>
    );
  }

  return (
    <div className={styles.fieldRow}>
      <Popover
        trigger="click"
        position={position}
        popupVisible={open}
        onVisibleChange={handleVisibleChange}
        content={popoverContent}
        getPopupContainer={getPopupContainer}
        className={popoverClassName}
      >
        {props.children || swatchTrigger}
      </Popover>
      <Input
        className={styles.hexInput}
        prefix="#"
        value={displayHex}
        placeholder="000000"
        onChange={onInputChange}
        autoComplete="off"
      />
    </div>
  );
}
