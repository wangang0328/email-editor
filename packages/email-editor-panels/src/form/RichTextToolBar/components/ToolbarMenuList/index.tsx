import { ScrollArea } from '@wa-dev/email-editor-ui';
import { Check } from 'lucide-react';
import React from 'react';
import styleText from '../../styles/ToolsPopover.css?inline';

export type ToolbarMenuOption = {
  value: string;
  label: React.ReactNode;
  style?: React.CSSProperties;
};

export function ToolbarMenuList({
  options,
  value,
  onSelect,
  minWidth = 140,
  maxWidth = 220,
  maxHeight = 280,
}: {
  options: ToolbarMenuOption[];
  value?: string;
  onSelect: (value: string) => void;
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
}) {
  return (
    <>
      <style>{styleText}</style>
      <ScrollArea style={{ height: Math.min(maxHeight, options.length * 36 + 8) }}>
        <div
          className='ee-toolbar-menu'
          style={{ minWidth, maxWidth }}
          role='listbox'
        >
          {options.map(item => {
            const selected = item.value === value;
            return (
              <button
                key={item.value}
                type='button'
                role='option'
                aria-selected={selected}
                data-selected={selected ? 'true' : 'false'}
                className='ee-toolbar-menu-item'
                style={item.style}
                onMouseDown={e => {
                  // 保留画布选区，避免点击菜单时失焦清空 range
                  e.preventDefault();
                }}
                onClick={() => onSelect(item.value)}
              >
                <span className='ee-toolbar-menu-item-label'>{item.label}</span>
                <span className='ee-toolbar-menu-item-check' aria-hidden>
                  <Check size={14} strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
