import { Popover } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { ToolItem } from '../ToolItem';
import { ToolbarMenuList } from '../ToolbarMenuList';
import { useFontFamilySelectOptions } from '@panels/hooks/useFontFamilySelectOptions';
import { unlockRichTextToolbar } from '../../../RichTextField/richTextToolbarInteraction';
import { useFontFamilyState } from '../../hooks/useFontFamilyState';
import { useRichTextToolbarPopover } from '../../hooks/useRichTextToolbarPopover';

export interface FontFamilyProps {
  execCommand: (cmd: string, value: any) => void;
  getPopupContainer: () => HTMLElement;
}

export function FontFamily(props: FontFamilyProps) {
  const { options: fontList } = useFontFamilySelectOptions();
  const { execCommand, getPopupContainer } = props;
  const [visible, setVisible] = React.useState(false);
  const currentFamily = useFontFamilyState();
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const onChange = useMemoizedFn((val: string) => {
    execCommand('fontName', val);
    setVisible(false);
    unlockRichTextToolbar();
  });

  const onVisibleChange = useMemoizedFn((v: boolean) => {
    setVisible(v);
    onPopoverVisibleChange(v);
  });

  const currentOption = fontList.find(
    item => item.value?.toLowerCase() === currentFamily?.toLowerCase(),
  );
  const currentKey = currentOption?.value || '';
  const displayLabel =
    (typeof currentOption?.label === 'string' ? currentOption.label : null) ||
    currentFamily ||
    t`字体`;

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
          minWidth={168}
          maxWidth={240}
          value={currentKey}
          onSelect={onChange}
          options={fontList.map(item => ({
            value: String(item.value),
            label: item.label,
            style: { fontFamily: String(item.value) },
          }))}
        />
      )}
    >
      <ToolItem
        asPopoverTrigger
        title={t`字体`}
        isActive={visible}
        style={{ width: 'auto', padding: '0 6px' }}
        icon={(
          <span className='ee-toolbar-trigger-label'>
            <span
              className='ee-toolbar-trigger-label-text'
              style={{ fontFamily: currentKey || undefined }}
            >
              {displayLabel}
            </span>
            <ChevronDown size={12} className='ee-toolbar-trigger-chevron' />
          </span>
        )}
      />
    </Popover>
  );
}
