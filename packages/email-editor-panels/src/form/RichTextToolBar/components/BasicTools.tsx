import { t } from '@lingui/core/macro';
import {
  useBlock,
  useEditorProps,
  useFocusIdx,
  resolveBlockIdxForStructureOp,
} from '@wa-dev/email-editor-editor';
import { Copy, CornerLeftUp, Star, Trash2 } from 'lucide-react';
import { useAddToCollection } from '@panels/hooks/useAddToCollection';
import { getParentIdx } from '@wa-dev/email-editor-blocks-react';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { ToolItem } from './ToolItem';
import {
  lockRichTextToolbar,
  unlockRichTextToolbar,
} from '../../RichTextField/richTextToolbarInteraction';

export function BasicTools() {
  const { copyBlock, removeBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const { onAddCollection } = useEditorProps();

  const resolveTargetIdx = useMemoizedFn(() =>
    resolveBlockIdxForStructureOp(focusIdx),
  );

  const runStructureAction = useMemoizedFn(
    (action: (idx: string) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = resolveTargetIdx();
      lockRichTextToolbar();
      try {
        action(idx);
      } finally {
        unlockRichTextToolbar();
      }
    },
  );

  const handleAddToCollection = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setModalVisible(true);
  };

  const handleCopy = runStructureAction(copyBlock);
  const handleDelete = runStructureAction(removeBlock);
  const handleSelectParent = runStructureAction((idx) => {
    const parentIdx = getParentIdx(idx);
    if (parentIdx) {
      setFocusIdx(parentIdx);
    }
  });

  return (
    <div style={{ marginRight: 40 }}>
      <span style={{ position: 'relative', marginRight: 10, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI' }}>{t`文本`}</span>
      <ToolItem
        onMouseDown={handleSelectParent}
        title={t`选择父级块`}
        icon={<CornerLeftUp size={16} />}
      />
      <ToolItem
        onMouseDown={handleCopy}
        title={t({ context: 'richtext.toolbar', message: '复制' })}
        icon={<Copy size={16} />}
      />
      {
        onAddCollection && (
          <ToolItem
            onClick={handleAddToCollection}
            title={t`添加到收藏`}
            icon={<Star size={16} />}
          />
        )
      }
      <ToolItem
        onMouseDown={handleDelete}
        title={t({ context: 'richtext.toolbar', message: '删除' })}
        icon={<Trash2 size={16} />}
      />
      {modal}
    </div>
  );
}
