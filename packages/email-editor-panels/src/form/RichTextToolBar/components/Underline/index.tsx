import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Underline as UnderlineIcon } from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { useFormatActive } from '../../hooks/useFormatActive';

export interface UnderlineProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

export function Underline(props: UnderlineProps) {
  const { onChange } = props;
  const isActive = useFormatActive('underline');

  const onClick = useMemoizedFn(() => {
    onChange();
  });

  return (
    <Tooltip color='#fff' position='tl' content={t`下划线`}>
      <ToolItem keepSelection title={t`下划线`} isActive={isActive} icon={<UnderlineIcon size={16} />} onClick={onClick} />
    </Tooltip>
  );
}
