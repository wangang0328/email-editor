import {
  useEditorProps,
  MergeTagBadge,
  getShadowRoot,
  suppressInlineTextPreserve,
  CONTENT_EDITABLE_CLASS_NAME,
  DATA_CONTENT_EDITABLE_TYPE,
  ContentEditableType,
  resolveContentEditableFormPath,
  RICH_TEXT_BAR_ID,
  FIXED_CONTAINER_ID,
  useBlock,
} from '@wa-dev/email-editor-editor';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InlineText, InlineTextProps } from '../InlineTextField';
import { RichTextToolBar } from '../RichTextToolBar';
import { Field, FieldInputProps } from 'react-final-form';
import { debounce } from 'lodash-es';
import {
  isRichTextChromeInteraction,
  isRichTextToolbarInteraction,
  isRichTextToolbarLocked,
} from './richTextToolbarInteraction';
import { isTableCellFieldPath, syncTableCellsFromDom } from './tableCellSync';

export interface RichTextFieldProps extends Omit<InlineTextProps, 'onChange' | 'mutators'> {
  /** 富文本条是否附带块级操作（复制/删除等），表格等场景应关闭 */
  blockTools?: boolean;
}

export const RichTextField = (props: RichTextFieldProps) => {
  const { blockTools, ...restProps } = props;
  const [contentEditableName, setContentEditableName] = useState('');
  const [contentEditableType, setContentEditableType] = useState<string | null>(
    CONTENT_EDITABLE_CLASS_NAME
  );
  const lastEditableNameRef = useRef('');
  const lastEditableTypeRef = useRef<string | null>(CONTENT_EDITABLE_CLASS_NAME);

  const setEditingState = (name: string, type: string | null) => {
    if (name) {
      lastEditableNameRef.current = name;
      lastEditableTypeRef.current = type;
    }
    setContentEditableName(name);
    if (type !== null) {
      setContentEditableType(type);
    }
  };

  const clearEditingState = () => {
    lastEditableNameRef.current = '';
    lastEditableTypeRef.current = CONTENT_EDITABLE_CLASS_NAME;
    setContentEditableName('');
    setContentEditableType(CONTENT_EDITABLE_CLASS_NAME);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (isRichTextChromeInteraction(e)) {
        return;
      }
      const target = e.target as Element | null;
      if (target?.closest?.('[data-email-editor-sidebar]')) {
        const active = getShadowRoot()?.activeElement;
        if (
          active instanceof HTMLElement &&
          active.getAttribute('contenteditable') === 'true'
        ) {
          active.blur();
        }
        suppressInlineTextPreserve();
        clearEditingState();
        return;
      }
      clearEditingState();
    };

    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    const root = getShadowRoot();
    if (!root) return;

    const isToolbarFocused = (active: Element | null) => {
      if (!active) {
        return false;
      }
      const bar =
        root.getElementById(RICH_TEXT_BAR_ID) ??
        root.querySelector(`#${RICH_TEXT_BAR_ID}`);
      return Boolean(bar?.contains(active));
    };

    const syncFromActiveElement = (e?: Event) => {
      if (e && isRichTextToolbarInteraction(e)) {
        return;
      }

      const activeElement = getShadowRoot()?.activeElement;
      if (activeElement instanceof Element && isToolbarFocused(activeElement)) {
        return;
      }

      if (!activeElement) {
        if (
          isRichTextToolbarLocked() ||
          (e && isRichTextToolbarInteraction(e)) ||
          (document.activeElement instanceof Element &&
            document.activeElement.closest(`#${FIXED_CONTAINER_ID}`))
        ) {
          return;
        }
        clearEditingState();
        return;
      }

      const idxName = resolveContentEditableFormPath(activeElement);
      const type = activeElement.getAttribute(DATA_CONTENT_EDITABLE_TYPE);
      if (type !== null) {
        setContentEditableType(type);
      }
      if (idxName) {
        setEditingState(idxName, type);
      } else {
        clearEditingState();
      }
    };

    const onClick = (e: Event) => {
      if (isRichTextToolbarInteraction(e)) {
        return;
      }
      syncFromActiveElement(e);
    };

    root.addEventListener('focusin', syncFromActiveElement);
    root.addEventListener('click', onClick);
    syncFromActiveElement();

    return () => {
      root.removeEventListener('focusin', syncFromActiveElement);
      root.removeEventListener('click', onClick);
    };
  }, []);

  const effectiveName = contentEditableName || lastEditableNameRef.current;

  const effectiveType =
    contentEditableType ||
    lastEditableTypeRef.current ||
    CONTENT_EDITABLE_CLASS_NAME;

  if (!effectiveName) return null;

  return (
    <>
      <Field name={effectiveName} parse={(v) => v}>
        {({ input }) => (
          <FieldWrapper
            {...restProps}
            blockTools={blockTools}
            contentEditableType={effectiveType}
            input={input}
          />
        )}
      </Field>
    </>
  );
};

function FieldWrapper(
  props: Omit<InlineTextProps, 'onChange'> & {
    input: FieldInputProps<any, HTMLElement>;
    contentEditableType: string | null;
    blockTools?: boolean;
  }
) {
  const { input, contentEditableType, blockTools, ...rest } = props;
  const { mergeTagGenerate, enabledMergeTagsBadge, toolbar } = useEditorProps();
  const { change } = useBlock();

  const persistTextChange = useMemo(
    () =>
      debounce((val: string) => {
        if (enabledMergeTagsBadge) {
          input.onChange(MergeTagBadge.revert(val, mergeTagGenerate));
        } else {
          input.onChange(val);
        }
        input.onBlur();
      }, 200),
    [enabledMergeTagsBadge, input, mergeTagGenerate],
  );

  const callbackChange = useMemoizedFn((val: string) => {
    if (isTableCellFieldPath(input.name)) {
      syncTableCellsFromDom(input.name, (path, html) => {
        const next = enabledMergeTagsBadge
          ? MergeTagBadge.revert(html, mergeTagGenerate)
          : html;
        change(path, next);
      });
      input.onBlur();
      return;
    }
    persistTextChange(val);
  });

  useEffect(() => {
    return () => {
      persistTextChange.flush();
    };
  }, [persistTextChange]);

  return (
    <>
      {contentEditableType === ContentEditableType.RichText && (
        <RichTextToolBar
          onChange={callbackChange}
          toolbar={toolbar}
          blockTools={blockTools}
        />
      )}
      <InlineText {...rest} onChange={callbackChange} />
    </>
  );
}
