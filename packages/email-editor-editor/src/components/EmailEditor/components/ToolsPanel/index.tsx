import { t } from '@lingui/core/macro';
import { Stack } from '@/components/UI/Stack';
import React from 'react';
import { useBlock } from '@/hooks/useBlock';
import { Redo2, Undo2 } from 'lucide-react';

const toolBtnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  borderRadius: 6,
  border: '1px solid transparent',
  background: 'transparent',
  color: 'var(--color-text-2, #4e5969)',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease',
};

export function ToolsPanel() {
  const { redo, undo, redoable, undoable } = useBlock();

  return (
    <Stack alignment='center'>
      <button
        type='button'
        title={t`撤销`}
        aria-label={t`撤销`}
        disabled={!undoable}
        onClick={undo}
        style={{
          ...toolBtnBase,
          opacity: undoable ? 1 : 0.4,
          cursor: undoable ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => {
          if (!undoable) return;
          e.currentTarget.style.borderColor = 'var(--color-border-2, #e5e6eb)';
          e.currentTarget.style.color = 'var(--color-text-1, #1d2129)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-2, #4e5969)';
        }}
      >
        <Undo2 size={15} />
      </button>

      <button
        type='button'
        title={t`重做`}
        aria-label={t`重做`}
        disabled={!redoable}
        onClick={redo}
        style={{
          ...toolBtnBase,
          opacity: redoable ? 1 : 0.4,
          cursor: redoable ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => {
          if (!redoable) return;
          e.currentTarget.style.borderColor = 'var(--color-border-2, #e5e6eb)';
          e.currentTarget.style.color = 'var(--color-text-1, #1d2129)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-2, #4e5969)';
        }}
      >
        <Redo2 size={15} />
      </button>
      <Stack.Item />
    </Stack>
  );
}
