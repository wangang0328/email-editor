import { t } from '@lingui/core/macro';
import { ColorPicker } from '@panels/form/ColorPicker';
import { useFocusBlockLayout } from '@wa-dev/email-editor-editor';
import { Palette } from 'lucide-react';
import React, { useMemo } from 'react';
import { ToolItem } from '../../ToolItem';
import { getStyleTargetElement } from '../../../utils/selection';
import { useRichTextToolbarPopover } from '../../../hooks/useRichTextToolbarPopover';

export function IconFontColor({ selectionRange, execCommand, getPopoverMountNode }: { selectionRange: Range | null; execCommand: (cmd: string, val?: any) => void; getPopoverMountNode: () => HTMLElement; }) {
  const { focusBlockNode } = useFocusBlockLayout();
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const color = useMemo(() => {
    const el = getStyleTargetElement(selectionRange, focusBlockNode);
    if (!el) return undefined;
    return getComputedStyle(el).color;
  }, [selectionRange, focusBlockNode]);

  return (
    <ColorPicker
      label=''
      position='tl'
      className='email-editor-toolbar-dropdown'
      onChange={(color) => execCommand('foreColor', color)}
      getPopupContainer={getPopoverMountNode}
      onVisibleChange={onPopoverVisibleChange}
      showInput={false}
    >
      <ToolItem
        asPopoverTrigger
        icon={(
          <div style={{
            position: 'relative'
          }}
          >
            <Palette size={12} style={{ position: 'relative', top: '-1px' }} />
            <div style={{ borderBottom: `2px solid ${color}`, position: 'absolute', width: '130%', left: '-15%', top: 16 }} />
          </div>
        )}
        title={t`文字颜色`}
      />
    </ColorPicker>

  );
}