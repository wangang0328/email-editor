import { t } from '@lingui/core/macro';
import React, { useMemo } from 'react';
import {
  getShadowRoot,
  useEditorContext,
  useFocusIdx,
} from '@wa-dev/email-editor-editor';
import {
  RichTextField,
  PresetColorsProvider,
  SelectionRangeProvider,
  TableOperation,
} from '@wa-dev/email-editor-panels';
import { AdvancedType, BasicType } from '@wa-dev/email-editor-blocks-react';
import ReactDOM from 'react-dom';
import { useFocusBlockData } from '@extensions/hooks/useFocusBlockData';
import { BlockAttributeConfigurationManager } from './utils/BlockAttributeConfigurationManager';

function isTableBlock(type: string | undefined): boolean {
  return type === BasicType.TABLE || type === AdvancedType.TABLE;
}

function isTextLikeBlock(type: string | undefined): boolean {
  return type === BasicType.TEXT || type === AdvancedType.TEXT;
}

export interface AttributePanelProps {}

export function AttributePanel() {
  const focusBlock = useFocusBlockData();
  const { initialized } = useEditorContext();
  const { focusIdx } = useFocusIdx();

  const PanelComponent = useMemo(() => {
    if (!focusBlock?.type) return null;
    return BlockAttributeConfigurationManager.get(focusBlock.type);
  }, [focusBlock?.type]);

  const panelBody = useMemo(() => {
    if (!PanelComponent) return null;
    return <PanelComponent key={focusIdx} />;
  }, [PanelComponent, focusIdx]);

  const shadowRoot = getShadowRoot();

  if (!initialized) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-3,#86909c)]">{t`编辑器加载中…`}</div>
    );
  }

  if (!panelBody) {
    if (!focusBlock) {
      return (
        <div className="p-6 text-sm text-[var(--color-text-3,#86909c)]">{t`正在同步选中块…`}</div>
      );
    }
    return (
      <div className="p-6 text-sm text-[var(--color-text-3,#86909c)]">
        <div>{t`无匹配的组件`}</div>
        {focusBlock?.type ? (
          <div className="mt-2 text-xs">{focusBlock.type}</div>
        ) : null}
      </div>
    );
  }

  return (
    <SelectionRangeProvider>
      <PresetColorsProvider>
        {panelBody}
        {(isTextLikeBlock(focusBlock?.type) || isTableBlock(focusBlock?.type)) ? (
          <div style={{ position: 'absolute' }}>
            <RichTextField
              idx={focusIdx}
              blockTools={isTextLikeBlock(focusBlock?.type)}
            />
          </div>
        ) : null}
        {isTableBlock(focusBlock?.type) && <TableOperation />}
        {shadowRoot &&
          ReactDOM.createPortal(
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />,
            shadowRoot,
          )}
      </PresetColorsProvider>
    </SelectionRangeProvider>
  );
}
