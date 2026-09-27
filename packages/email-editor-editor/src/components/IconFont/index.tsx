import React from 'react';
import type { LucideIcon } from 'lucide-react';

export function IconFont(props: {
  icon: LucideIcon;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClickCapture?: React.MouseEventHandler<HTMLDivElement>;
  size?: number;
  style?: React.CSSProperties;
  title?: string;
}) {
  const { icon: IconComponent, size = 16, style, title, onClick, onClickCapture } = props;

  return (
    <div
      title={title}
      onClick={onClick}
      onClickCapture={onClickCapture}
      style={{
        cursor: onClick ? 'pointer' : 'inherit',
        pointerEvents: 'auto',
        color: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <IconComponent size={size} aria-label={title} style={{ cursor: 'inherit' }} />
    </div>
  );
}
