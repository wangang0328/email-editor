import {
  Tree,
  type TreeDataNode,
  type TreeProps,
} from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useMemo, useState } from 'react';

interface TreeNode<T> {
  id: string;
  children?: T[];
}

export interface BlockTreeProps<T extends TreeNode<T>> {
  treeData: T[];
  selectedKeys?: string[];
  expandedKeys?: string[];
  onSelect: (selectedId: string) => void;
  onContextMenu?: (nodeData: T, ev: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMouseLeave?: () => void;
  onMouseEnter?: (id: string) => void;
  renderTitle: (data: T) => React.ReactNode;
  defaultExpandAll?: boolean;
  allowDrop: (o: {
    dragNode: { type: string } | { key: string };
    dropNode: { dataRef: T; parent: T; key: string };
    dropPosition: number;
  }) =>
    | false
    | {
        key: string;
        position: number;
      };

  onDrop: (o: {
    dragNode: { dataRef: T; parent: T; key: string; parentKey: string };
    dropNode: { dataRef: T; parent: T; key: string; parentKey: string };
    dropPosition: number;
  }) => void;
}

const fileNames = {
  key: 'id',
};

export function BlockTree<T extends TreeNode<T>>(props: BlockTreeProps<T>) {
  const [blockTreeRef, setBlockTreeRef] = useState<HTMLElement | null>(null);

  const { treeData, allowDrop, onContextMenu, selectedKeys } = props;
  const {
    onDragStart: propsDragStart,
    onDrop: propsDrop,
    renderTitle: propsRenderTitle,
    onDragEnd: propsDragEnd,
    onSelect: propsSelect,
  } = props;

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const onExpand = useMemoizedFn((keys: string[]) => {
    setExpandedKeys(keys);
  });

  useEffect(() => {
    if (props.defaultExpandAll) {
      const keys: string[] = [];
      const loop = (data: T) => {
        keys.push(data.id);
        data.children?.forEach(loop);
      };
      treeData.forEach(loop);
      setExpandedKeys(keys);
    }
  }, [props.defaultExpandAll, treeData]);

  useEffect(() => {
    setExpandedKeys((keys) =>
      props.expandedKeys ? [...keys, ...props.expandedKeys] : keys
    );
  }, [props.expandedKeys]);

  const onTreeDrop = useMemoizedFn(
    (info: Parameters<NonNullable<TreeProps['onDrop']>>[0]) => {
      propsDrop(info as unknown as Parameters<BlockTreeProps<T>['onDrop']>[0]);
    }
  );

  const onCanDrop = useMemoizedFn(
    (option: Parameters<NonNullable<TreeProps['canDrop']>>[0]) => {
      return allowDrop({
        dragNode: option.dragNode,
        dropNode: option.dropNode as unknown as {
          dataRef: T;
          parent: T;
          key: string;
        },
        dropPosition: option.dropPosition,
      });
    }
  );

  const renderTitle: TreeProps['renderTitle'] = useMemoizedFn((nodeData) => {
    return (
      <div
        style={{ display: 'inline-flex', width: '100%' }}
        onContextMenu={(ev) => onContextMenu && onContextMenu(nodeData as T, ev)}
      >
        {propsRenderTitle(nodeData as T)}
      </div>
    );
  });

  const onDragEnd = useMemoizedFn(() => {
    propsDragEnd?.();
  });

  const onSelect: TreeProps['onSelect'] = useMemoizedFn((selectedKeys) => {
    propsSelect(selectedKeys[0]);
  });

  useEffect(() => {
    if (blockTreeRef) {
      blockTreeRef.addEventListener('dragover', (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      });
    }
  }, [blockTreeRef]);

  return (
    <div
      ref={setBlockTreeRef}
      onMouseLeave={props.onMouseLeave}
      className="h-full min-h-0 overflow-hidden"
    >
      <Tree
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        draggable
        size="small"
        treeData={treeData as unknown as TreeDataNode[]}
        blockNode
        fieldNames={fileNames}
        onDragEnd={onDragEnd}
        onDragStart={propsDragStart ? () => propsDragStart() : undefined}
        onDrop={onTreeDrop}
        canDrop={onCanDrop}
        onSelect={onSelect}
        renderTitle={renderTitle}
        className="h-full min-h-0 overflow-hidden"
        style={{ height: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
