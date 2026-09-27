import { Popover } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { ToolItem } from '../ToolItem';
import { ToolbarMenuList } from '../ToolbarMenuList';
import { unlockRichTextToolbar } from '../../../RichTextField/richTextToolbarInteraction';
import { useFontSizeState } from '../../hooks/useFontSizeState';
import { useRichTextToolbarPopover } from '../../hooks/useRichTextToolbarPopover';
import { RICH_TEXT_FONT_SIZE_OPTIONS } from '../../shared/fontSizeOptions';

export interface FontSizeProps {
  execCommand: (cmd: string, value: any) => void;
  getPopupContainer: () => HTMLElement;
}

export function FontSize(props: FontSizeProps) {
  const { execCommand, getPopupContainer } = props;
  const [visible, setVisible] = React.useState(false);
  const currentSize = useFontSizeState();
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const onChange = useMemoizedFn((val: string) => {
    execCommand('fontSize', val);
    setVisible(false);
    unlockRichTextToolbar();
  });

  const onVisibleChange = useMemoizedFn((v: boolean) => {
    setVisible(v);
    onPopoverVisibleChange(v);
  });

  const currentOption = RICH_TEXT_FONT_SIZE_OPTIONS.find(
    item => item.label === currentSize || item.px === currentSize,
  );
  const currentKey = currentOption?.value || '';
  const displayLabel = currentOption?.label || currentSize || 'Aa';

  return (
    <Popover
      trigger='click'
      position='bl'
      className='ee-tools-popover email-editor-toolbar-dropdown p-0'
      popupVisible={visible}
      onVisibleChange={onVisibleChange}
      getPopupContainer={getPopupContainer}
      content={(
        <ToolbarMenuList
          minWidth={120}
          maxWidth={160}
          value={currentKey}
          onSelect={onChange}
          options={RICH_TEXT_FONT_SIZE_OPTIONS.map(item => ({
            value: item.value,
            label: item.label,
            style: { fontSize: item.px },
          }))}
        />
      )}
    >
      <ToolItem
        asPopoverTrigger
        title={t`字号`}
        isActive={visible}
        style={{ width: 'auto', padding: '0 6px' }}
        icon={(
          <span className='ee-toolbar-trigger-label'>
            <span className='ee-toolbar-trigger-label-text'>{displayLabel}</span>
            <ChevronDown size={12} className='ee-toolbar-trigger-chevron' />
          </span>
        )}
      />
    </Popover>
  );
}
