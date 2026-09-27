import { Eye, EyeOff } from 'lucide-react';
import { t } from '@lingui/core/macro';

import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { useBlock } from '@wa-dev/email-editor-editor';
import { BasicType } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '@wa-dev/email-editor-blocks-react';
import { ScrollArea } from '@wa-dev/email-editor-ui';

export interface AttributesPanelWrapper {
  style?: React.CSSProperties;
  extra?: React.ReactNode;
  children: React.ReactNode | React.ReactElement;
}

export const AttributesPanelWrapper: React.FC<AttributesPanelWrapper> = props => {
  const { focusBlock } = useBlock();
  const block = focusBlock && getBlockByType(focusBlock.type);

  if (!focusBlock) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-3,#86909c)]">{t`未选中块`}</div>
    );
  }

  if (!block) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-3,#86909c)]">
        {t`未知块类型`}: {focusBlock.type}
      </div>
    );
  }

  return (
    <div className="ee-attr-panel flex h-full min-h-0 flex-col bg-[var(--ee-panel-bg,#fafafa)]">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[var(--ee-panel-border,rgba(0,0,0,0.06))] bg-transparent px-4">
        <div className="flex min-w-0 items-center gap-1">
          <EyeIcon />
          <span className="truncate text-[13px] font-medium tracking-wide text-[var(--color-text-1,#1d2129)]">
            {`${block.name} `}
            {t`属性`}
          </span>
        </div>
        {props.extra ? <div className="shrink-0">{props.extra}</div> : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="pb-4" style={props.style}>
          {props.children}
        </div>
      </ScrollArea>
    </div>
  );
};

function EyeIcon() {
  const { setFocusBlock, focusBlock } = useBlock();

  const onToggleVisible = useMemoizedFn((e: React.MouseEvent) => {
    if (!focusBlock) return;
    e.stopPropagation();
    setFocusBlock({
      ...focusBlock,
      data: {
        ...focusBlock.data,
        hidden: !focusBlock.data.hidden,
      },
    });
  });

  if (!focusBlock) return null;
  if (focusBlock.type === BasicType.PAGE) return null;

  const hidden = Boolean(focusBlock.data.hidden);
  const Icon = hidden ? EyeOff : Eye;

  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--color-text-2,#4e5969)] transition-colors hover:border-[var(--color-border-2,#e5e6eb)] hover:text-[var(--color-text-1,#1d2129)]"
      aria-label={hidden ? t`显示块` : t`隐藏块`}
      onClick={onToggleVisible}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
