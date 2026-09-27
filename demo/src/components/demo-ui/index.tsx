import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Modal, Button, cn } from '@demo/components/app-ui';

/* ─── Popconfirm（Arco API 兼容） ─── */
export interface PopconfirmProps {
  title: React.ReactNode;
  children: React.ReactElement;
  onConfirm?: () => void;
  onOk?: (e?: React.MouseEvent) => void;
  okText?: string;
  cancelText?: string;
}

export function Popconfirm({
  title,
  children,
  onConfirm,
  onOk,
  okText = 'Ok',
  cancelText = 'Cancel',
}: PopconfirmProps) {
  const [open, setOpen] = useState(false);

  const handleOk = (e?: React.MouseEvent) => {
    onOk?.(e);
    onConfirm?.();
    setOpen(false);
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
          children.props.onClick?.(e);
          if (!e.defaultPrevented) {
            setOpen(true);
          }
        },
      })}
      <Modal
        visible={open}
        title={title}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText={okText}
        cancelText={cancelText}
      />
    </>
  );
}

/* ─── Tag ─── */
export interface TagProps {
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  color?: string;
}

export function Tag({ children, closable, onClose, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-sm text-primary',
        className,
      )}
    >
      {children}
      {closable && (
        <button
          type="button"
          className="rounded hover:bg-primary/20 leading-none"
          onClick={onClose}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

/* ─── Badge ─── */
export interface BadgeProps {
  count?: number;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ count, children, className }: BadgeProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      {children}
      {count != null && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}

/* ─── PageHeader ─── */
export interface PageHeaderProps {
  title?: React.ReactNode;
  backIcon?: React.ReactNode;
  onBack?: () => void;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PageHeader({
  title,
  backIcon,
  onBack,
  extra,
  className,
  style,
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex items-center gap-3 border-b bg-background px-4 py-3', className)}
      style={style}
    >
      {onBack && (
        <button
          type="button"
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          {backIcon ?? <ArrowLeft className="h-5 w-5" />}
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {extra}
    </div>
  );
}

/* ─── Breadcrumb ─── */
export function Breadcrumb({ children }: { children?: React.ReactNode }) {
  return <nav className="text-sm text-muted-foreground">{children}</nav>;
}

Breadcrumb.Item = function BreadcrumbItem({ children }: { children?: React.ReactNode }) {
  return <span>{children}</span>;
};
