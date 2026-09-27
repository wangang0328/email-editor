import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Bold as BoldIcon } from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { useFormatActive } from '../../hooks/useFormatActive';

export interface BoldProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

export function Bold(props: BoldProps) {
  const { onChange } = props;
  const isActive = useFormatActive('bold');

  const onClick = useMemoizedFn(() => {
    onChange();
  });

  return (
    <Tooltip color='#fff' position='tl' content={t`加粗`}>
      <ToolItem keepSelection title={t`加粗`} isActive={isActive} icon={<BoldIcon size={16} />} onClick={onClick} />
    </Tooltip>
  );
}
