import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { Italic as ItalicIcon } from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { useFormatActive } from '../../hooks/useFormatActive';

export interface ItalicProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

export function Italic(props: ItalicProps) {
  const { onChange } = props;
  const isActive = useFormatActive('italic');

  const onClick = useMemoizedFn(() => {
    onChange();
  });

  return (
    <Tooltip color='#fff' position='tl' content={t`斜体`}>
      <ToolItem keepSelection title={t`斜体`} isActive={isActive} icon={<ItalicIcon size={16} />} onClick={onClick} />
    </Tooltip>
  );
}
