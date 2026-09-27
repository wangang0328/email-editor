import { Popover } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React from 'react';

import { MergeTags as MergeTagsOptions } from '@panels/fields';

import { Braces } from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { unlockRichTextToolbar } from '../../../RichTextField/richTextToolbarInteraction';
import { useRichTextToolbarPopover } from '../../hooks/useRichTextToolbarPopover';

export interface MergeTagsProps {
  execCommand: (cmd: string, value: any) => void;
  getPopupContainer: () => HTMLElement;
}

export function MergeTags(props: MergeTagsProps) {
  const { execCommand } = props;
  const [visible, setVisible] = React.useState(false);
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const onChange = useMemoizedFn((val: string) => {
    execCommand('insertHTML', val);
    setVisible(false);
    unlockRichTextToolbar();
  });

  const onVisibleChange = useMemoizedFn((v: boolean) => {
    setVisible(v);
    onPopoverVisibleChange(v);
  });

  return (
    <Popover
      trigger='click'
      color='#fff'
      position='bl'
      className='ee-tools-popover email-editor-toolbar-dropdown'
      popupVisible={visible}
      onVisibleChange={onVisibleChange}
      content={(
        <MergeTagsOptions
          value=''
          onChange={onChange}
        />
      )}
      getPopupContainer={props.getPopupContainer}
    >
      <ToolItem
        asPopoverTrigger
        title={t`合并标签`}
        icon={<Braces size={16} />}
      />
    </Popover>
  );
}
