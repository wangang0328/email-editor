import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Strikethrough } from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { useFormatActive } from '../../hooks/useFormatActive';

export interface StrikeThroughProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

export function StrikeThrough(props: StrikeThroughProps) {
  const { onChange } = props;
  const isActive = useFormatActive('strikeThrough');

  const onClick = useMemoizedFn(() => {
    onChange();
  });

  return (
    <Tooltip color='#fff' position='tl' content={t`删除线`}>
      <ToolItem keepSelection title={t`删除线`} isActive={isActive} icon={<Strikethrough size={16} />} onClick={onClick} />
    </Tooltip>
  );
}
