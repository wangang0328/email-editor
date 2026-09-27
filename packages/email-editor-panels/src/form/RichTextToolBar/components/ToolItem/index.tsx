import { Tooltip } from '@wa-dev/email-editor-ui';
import { classnames } from '@wa-dev/email-editor-shared';
import React from 'react';

export const ToolItem = React.forwardRef<
  HTMLButtonElement,
  {
    title?: string;
    icon: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
    trigger?: string;
    style?: React.CSSProperties;
    isActive?: boolean;
    /** 作为 Popover 触发器时跳过 Tooltip 包裹，避免弹层无法打开 */
    asPopoverTrigger?: boolean;
    /** 点击时保持选区不丢失（用于加粗等直接操作） */
    keepSelection?: boolean;
  }
>((props, ref) => {
  const {
    title,
    icon,
    onClick,
    onMouseDown,
    style,
    isActive,
    asPopoverTrigger,
    keepSelection,
  } = props;

  const button = (
    <button
      ref={ref}
      tabIndex={-1}
      type='button'
      className={classnames(
        'wa-email-editor-extensions-emailToolItem',
        isActive && 'wa-email-editor-extensions-emailToolItem-active',
      )}
      title={asPopoverTrigger ? title : undefined}
      onMouseDown={
        onMouseDown ??
        (keepSelection ? (e) => e.preventDefault() : undefined)
      }
      onClick={onClick}
      style={style}
    >
      {icon}
    </button>
  );

  if (!title || asPopoverTrigger) {
    return button;
  }

  return (
    <Tooltip
      mini
      position='bottom'
      content={title}
    >
      {button}
    </Tooltip>
  );
});

ToolItem.displayName = 'ToolItem';
