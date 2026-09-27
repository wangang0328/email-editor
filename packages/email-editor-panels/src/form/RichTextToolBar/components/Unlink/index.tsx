import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Unlink as UnlinkIcon } from 'lucide-react';
import { ToolItem } from '../ToolItem';

export interface UnlinkProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

export function Unlink(props: UnlinkProps) {
  const onClick = useMemoizedFn(() => {
    props.onChange();
  });

  return (
    <Tooltip color='#fff' position='tl' content={t`取消链接`}>
      <ToolItem title={t`取消链接`} icon={<UnlinkIcon size={16} />} onClick={onClick} />
    </Tooltip>
  );
}
