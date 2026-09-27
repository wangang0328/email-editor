import { useEditorContext, useEditorProps } from '@wa-dev/email-editor-editor';
import { useMemo } from 'react';
import {
  resolveFontFamilyOptions,
  type FontFamilyOptionItem,
} from '@panels/shared/fontFamilyOptions';

export function useFontFamily() {
  const { fontList: editorFontList } = useEditorProps();
  const { pageData } = useEditorContext();

  const addFonts = pageData.data.value.fonts;

  const fontList = useMemo((): FontFamilyOptionItem[] => {
    return resolveFontFamilyOptions({
      editorFontValues: editorFontList?.map(item => String(item.value)),
      customFontNames: addFonts?.map(item => item.name),
    });
  }, [addFonts, editorFontList]);

  return {
    fontList,
  };
}
