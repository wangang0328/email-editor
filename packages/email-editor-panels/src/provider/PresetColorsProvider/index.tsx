import React, { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { debounce } from 'lodash-es';
import Color from 'color';
import { useRefState } from '@wa-dev/email-editor-editor';

const colorDivForNormalize = document.createElement('div');

function normalizeStoredColor(value: string): string | null {
  try {
    colorDivForNormalize.style.color = '';
    colorDivForNormalize.style.color = value;
    if (!colorDivForNormalize.style.color) {
      return null;
    }
    return Color(value).hex();
  } catch {
    return null;
  }
}

const defaultPresetColor: string[] = [
  '#000000',
  '#FFFFFF',
  '#9b9b9b',
  '#d0021b',
  '#4a90e2',
  '#7ed321',
  '#bd10e0',
  '#f8e71c',
];

const CURRENT_COLORS_KEY = 'CURRENT_COLORS_KEY';
const MAX_RECORD_SIZE = 20;

export const PresetColorsContext = React.createContext<{
  colors: string[];
  addCurrentColor: (color: string) => void;
}>({
  colors: [],
  addCurrentColor: () => {},
});

export const PresetColorsProvider: React.FC<{
  children: React.ReactNode | React.ReactElement;
}> = props => {
  const [currentColors, setCurrentColors] = useLocalStorage<string[]>(
    CURRENT_COLORS_KEY,
    defaultPresetColor,
  );
  const currentColorsRef = useRefState(currentColors);

  const addCurrentColor = useMemo(
    () =>
      debounce((newColor: string) => {
        const normalized = normalizeStoredColor(newColor);
        if (!normalized) return;

        const normalizedKey = normalized.toLowerCase();
        const hasDuplicate = currentColorsRef.current!.some(
          c => normalizeStoredColor(c)?.toLowerCase() === normalizedKey,
        );
        if (hasDuplicate) return;

        const newColors = [...currentColorsRef.current!, normalized]
          .filter(Boolean)
          .slice(-MAX_RECORD_SIZE);

        setCurrentColors(newColors);
      }, 500),
    [currentColorsRef, setCurrentColors],
  );

  const value = useMemo(() => {
    return {
      colors: currentColors!,
      addCurrentColor,
    };
  }, [addCurrentColor, currentColors]);

  return useMemo(() => {
    return (
      <PresetColorsContext.Provider value={value}>
        {props.children}
      </PresetColorsContext.Provider>
    );
  }, [props.children, value]);
};
