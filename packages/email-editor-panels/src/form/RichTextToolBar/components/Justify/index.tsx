import { Tooltip } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  type LucideIcon,
} from 'lucide-react';
import { ToolItem } from '../ToolItem';
import { useTextAlignActive } from '../../hooks/useTextAlignActive';
import { TextAlignValue } from '../../utils/selection';

function getAlignConfig(): Record<
  TextAlignValue,
  { icon: LucideIcon; title: string; command: string }
> {
  return {
    left: {
      icon: AlignLeft,
      title: t`左对齐`,
      command: 'justifyLeft',
    },
    center: {
      icon: AlignCenter,
      title: t`居中对齐`,
      command: 'justifyCenter',
    },
    right: {
      icon: AlignRight,
      title: t`右对齐`,
      command: 'justifyRight',
    },
    justify: {
      icon: AlignJustify,
      title: t`两端对齐`,
      command: 'justifyFull',
    },
  };
}

export function JustifyButton(props: {
  align: TextAlignValue;
  onChange: (command: string) => void;
}) {
  const { align, onChange } = props;
  const config = useMemo(() => getAlignConfig()[align], [align]);
  const isActive = useTextAlignActive(align);
  const IconComponent = config.icon;

  const onClick = useMemoizedFn(() => {
    onChange(config.command);
  });

  return (
    <Tooltip color='#fff' position='tl' content={config.title}>
      <ToolItem
        keepSelection
        title={config.title}
        isActive={isActive}
        icon={<IconComponent size={16} />}
        onClick={onClick}
      />
    </Tooltip>
  );
}
