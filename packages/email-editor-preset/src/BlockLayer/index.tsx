import { Space } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo, useState } from 'react';
import {
  DATA_ATTRIBUTE_DROP_CONTAINER,
  IconFont,
  scrollBlockEleIntoView,
  TextStyle,
  useBlock,
  useEditorContext,
  useFocusIdx,
  useHoverIdx,
  useRefState,
} from '@wa-dev/email-editor-editor';
import {
  BasicType,
  getChildIdx,
  getNodeIdxClassName,
  getPageIdx,
  getParentIdx,
  IBlockData,
} from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '../utils/blockRegistry';
import styles from './index.module.scss';
import { cloneDeep, get, isString } from 'lodash-es';
import { EyeIcon } from './components/EyeIcon';
import { BlockTree, BlockTreeProps } from './components/BlockTree';
import { ContextMenu } from './components/ContextMenu';
import { classnames } from '@wa-dev/email-editor-panels';
import { useAvatarWrapperDrop } from './hooks/useAvatarWrapperDrop';
import { getBlockTypeIcon } from '@extensions/utils/getBlockTypeIcon';
import { getBlockTitle } from '@extensions/utils/getBlockTitle';

export interface IBlockDataWithId extends IBlockData {
  id: string;
  icon?: React.ReactElement;
  parent: IBlockDataWithId | null;
  children: IBlockDataWithId[];
  className?: string;
}
export interface BlockLayerProps {
  renderTitle?: (block: IBlockDataWithId) => React.ReactNode;
}

export function BlockLayer(props: BlockLayerProps) {
  const { pageData } = useEditorContext();
  const { renderTitle: propsRenderTitle } = props;
  const { focusIdx, setFocusIdx, notifyFocusSelection } = useFocusIdx();
  const { setHoverIdx, setIsDragging } = useHoverIdx();
  const { moveBlock, setValueByIdx, copyBlock, removeBlock, values } = useBlock();

  const { setBlockLayerRef } = useAvatarWrapperDrop();

  const valueRef = useRefState(values);

  const [contextMenuData, setContextMenuData] = useState<{
    blockData: IBlockDataWithId;
    left: number;
    top: number;
  } | null>(null);

  const onToggleVisible = useMemoizedFn(({ id }: IBlockDataWithId, e: React.MouseEvent) => {
    e.stopPropagation();
    const blockData = get(valueRef.current, id) as IBlockData | null;

    if (blockData) {
      blockData.data.hidden = !Boolean(blockData.data.hidden);
      setValueByIdx(id, blockData);
    }
  });

  const renderTitle = useMemoizedFn((data: IBlockDataWithId) => {
      const isPage = data.type === BasicType.PAGE;
      const title = propsRenderTitle ? propsRenderTitle(data) : getBlockTitle(data);
      return (
        <div
          data-tree-idx={data.id}
          className={classnames(
            styles.title,
            !isPage && getNodeIdxClassName(data.id),
            !isPage && 'email-block',
          )}
        >
          <Space
            align='center'
            size='mini'
          >
            <IconFont
              icon={getBlockTypeIcon(data.type)}
              size={12}
              style={{ color: '#999' }}
            />
            <div
              title={isString(title) ? title : ''}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: '5em',
                textOverflow: 'ellipsis',
              }}
            >
              <TextStyle size='smallest'>{title}</TextStyle>
            </div>
          </Space>
          <div className={styles.eyeIcon}>
            <EyeIcon
              blockData={data}
              onToggleVisible={onToggleVisible}
            />
          </div>
        </div>
      );
  });

  const treeData = useMemo(() => {
    const copyData = cloneDeep(pageData) as IBlockDataWithId;
    const loop = (
      item: IBlockDataWithId,
      id: string,
      parent: IBlockDataWithId | null,
    ) => {
      item.id = id;
      item.parent = parent;
      item.children.map((child, index) => loop(child, getChildIdx(id, index), item));
    };

    loop(copyData, getPageIdx(), null);

    return [copyData];
  }, [pageData]);

  const onSelect = useMemoizedFn((selectedId: string) => {
    setFocusIdx(selectedId);
    notifyFocusSelection();
    setTimeout(() => {
      scrollBlockEleIntoView({ idx: selectedId });
    }, 50);
  });

  const onContextMenu = useMemoizedFn((blockData: IBlockDataWithId, ev: React.MouseEvent) => {
    ev.preventDefault();
    setContextMenuData({ blockData, left: ev.clientX, top: ev.clientY });
  });

  const onCloseContextMenu = useMemoizedFn((ev?: React.MouseEvent) => {
    setContextMenuData(null);
  });

  const onMouseEnter = useMemoizedFn((id: string) => {
    setHoverIdx(id);
  });

  const onMouseLeave = useMemoizedFn(() => {
    setHoverIdx('');
  });

  const onDragStart = useMemoizedFn(() => {
    setIsDragging(true);
  });

  const onDragEnd = useMemoizedFn(() => {
    setIsDragging(false);
  });

  const onDrop: BlockTreeProps<IBlockDataWithId>['onDrop'] = useMemoizedFn((params) => {
    const { dragNode, dropNode, dropPosition } = params;
    const dragBlock = getBlockByType(dragNode.dataRef.type);
    if (!dragBlock) return;
    if (!dragBlock.validParentType.includes(dropNode.dataRef.type)) return;

    // Tree 已把 dropNode 设为新父节点，dropPosition 为 insert-before 下标
    moveBlock(dragNode.key, dropNode.key, dropPosition);
  });

  /** Arborist Tree：dropNode 是放置父节点，与 useAvatarWrapperDrop（悬停节点）语义不同 */
  const blockTreeAllowDrop: BlockTreeProps<IBlockDataWithId>['allowDrop'] = useMemoizedFn(
    ({ dragNode, dropNode, dropPosition }) => {
      let dragType: string | undefined;
      if ('key' in dragNode) {
        const blockData = get(valueRef.current, dragNode.key) as IBlockData | undefined;
        if (!blockData) return false;
        dragType = blockData.type;
      } else {
        dragType = dragNode.type;
      }
      const dragBlock = getBlockByType(dragType);
      if (!dragBlock) return false;
      if (!dragBlock.validParentType.includes(dropNode.dataRef.type)) {
        return false;
      }
      // 禁止拖入自身或子树
      if (
        'key' in dragNode &&
        (dropNode.key === dragNode.key ||
          dropNode.key.startsWith(`${dragNode.key}.`))
      ) {
        return false;
      }
      return {
        position: dropPosition,
        key: dropNode.key,
      };
    },
  );

  const selectedKeys = useMemo(() => {
    if (!focusIdx) return [];

    return [focusIdx];
  }, [focusIdx]);

  const expandedKeys = useMemo(() => {
    if (!focusIdx) return [];
    let currentIdx = getParentIdx(focusIdx);
    const keys: string[] = [];
    while (currentIdx) {
      keys.push(currentIdx);
      currentIdx = getParentIdx(currentIdx);
    }
    return keys;
  }, [focusIdx]);

  return (
    <div
      ref={setBlockLayerRef}
      id='BlockLayerManager'
      className="flex h-full min-h-0 flex-col overflow-hidden"
      {...{
        [DATA_ATTRIBUTE_DROP_CONTAINER]: 'true',
      }}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <BlockTree<IBlockDataWithId>
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          defaultExpandAll
          treeData={treeData}
          renderTitle={renderTitle}
          allowDrop={blockTreeAllowDrop}
          onContextMenu={onContextMenu}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onSelect={onSelect}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </div>
      {contextMenuData && (
        <ContextMenu
          onClose={onCloseContextMenu}
          moveBlock={moveBlock}
          copyBlock={copyBlock}
          removeBlock={removeBlock}
          contextMenuData={contextMenuData}
        />
      )}
    </div>
  );
}
