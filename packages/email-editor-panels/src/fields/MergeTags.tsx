import { TreeSelect } from '@wa-dev/email-editor-ui';
import { Tree } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo, useState } from 'react';
import { get, isObject } from 'lodash-es';
import { useBlock, useEditorProps, useFocusIdx } from '@wa-dev/email-editor-editor';
import { getContextMergeTags } from '@panels/utils/getContextMergeTags';

export const MergeTags: React.FC<{
  onChange: (v: string) => void;
  value: string;
  isSelect?: boolean;
}> = React.memo((props) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { focusIdx } = useFocusIdx();
  const {
    mergeTags = {},
    mergeTagGenerate,
    renderMergeTagContent,
  } = useEditorProps();
  const { values } = useBlock();

  const contextMergeTags = useMemo(
    () => getContextMergeTags(mergeTags, values, focusIdx),
    [mergeTags, values, focusIdx]
  );

  const treeOptions = useMemo(() => {
    const treeData: Array<{
      key: any;
      value: any;
      title: string;
      children: never[];
    }> = [];
    const deep = (
      key: string,
      title: string,
      parent: { [key: string]: any; children?: any[] },
      mapData: Array<any> = []
    ) => {
      const currentMapData = {
        key: key,
        value: key,
        title: title,
        children: [],
      };

      mapData.push(currentMapData);
      const current = parent[title];
      if (current && typeof current === 'object') {
        Object.keys(current).map((childKey) =>
          deep(key + '.' + childKey, childKey, current, currentMapData.children)
        );
      }
    };

    Object.keys(contextMergeTags).map((key) =>
      deep(key, key, contextMergeTags, treeData)
    );
    return treeData;
  }, [contextMergeTags]);

  const onSelect = useMemoizedFn((key: string) => {
    const value = get(contextMergeTags, key);
    if (isObject(value)) {
      setExpandedKeys((keys) => {
        if (keys.includes(key)) {
          return keys.filter((k) => k !== key);
        } else {
          return [...keys, key];
        }
      });
      return;
    }
    return props.onChange(mergeTagGenerate(key));
  });

  const mergeTagContent = useMemo(
    () =>
      renderMergeTagContent ? (
        renderMergeTagContent({
          onChange: props.onChange,
          isSelect: Boolean(props.isSelect),
          value: props.value,
        })
      ) : (
        <></>
      ),
    [renderMergeTagContent, props.onChange, props.isSelect, props.value]
  );

  if (renderMergeTagContent) {
    return <>{mergeTagContent}</>;
  }

  return (
    <div style={{ color: '#333' }}>
      {props.isSelect ? (
        <TreeSelect
          value={props.value}
          size='small'
          dropdownMenuStyle={{ maxHeight: 400, overflow: 'auto' }}
          placeholder={t`请选择`}
          treeData={treeOptions}
          onChange={val => {
            const key = Array.isArray(val) ? val[0] : val;
            if (typeof key === 'string') onSelect(key);
          }}
        />
      ) : (
        <Tree
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          selectedKeys={[]}
          treeData={treeOptions}
          onSelect={(vals: any[]) => onSelect(vals[0])}
          style={{
            maxHeight: 400,
            overflow: 'auto',
          }}
        />
      )}
    </div>
  );
});
