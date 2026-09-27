import { t } from '@lingui/core/macro';
import { ColorPicker } from '@panels/form/ColorPicker';
import { useFocusBlockLayout } from '@wa-dev/email-editor-editor';
import { PaintBucket } from 'lucide-react';
import React, { useMemo } from 'react';
import { ToolItem } from '../../ToolItem';
import { getStyleTargetElement } from '../../../utils/selection';
import { useRichTextToolbarPopover } from '../../../hooks/useRichTextToolbarPopover';

export function IconBgColor({ selectionRange, execCommand, getPopoverMountNode }: { selectionRange: Range | null; execCommand: (cmd: string, val?: any) => void; getPopoverMountNode: () => HTMLElement; }) {
  const { focusBlockNode } = useFocusBlockLayout();
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const color = useMemo(() => {
    const el = getStyleTargetElement(selectionRange, focusBlockNode);
    if (!el) return undefined;
    return getComputedStyle(el).backgroundColor;
  }, [selectionRange, focusBlockNode]);

  return (
    <ColorPicker
      label=''
      showInput={false}
      position='tl'
      className='email-editor-toolbar-dropdown'
      onChange={(color) => execCommand('hiliteColor', color)}
      getPopupContainer={getPopoverMountNode}
      onVisibleChange={onPopoverVisibleChange}
    >
      <ToolItem
        asPopoverTrigger
        icon={(
          <div style={{
            position: 'relative'
          }}
          >
            <PaintBucket size={12} style={{ position: 'relative', top: '-1px' }} />
            <div style={{ borderBottom: `2px solid ${color}`, position: 'absolute', width: '130%', left: '-15%', top: 16 }} />
          </div>
        )}
        title={t`背景颜色`}
      />
    </ColorPicker>

  );
}