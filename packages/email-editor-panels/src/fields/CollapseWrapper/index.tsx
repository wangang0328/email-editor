import { Collapse } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useState } from 'react';

import { useBlock, useEditorProps } from '@wa-dev/email-editor-editor';
import { isAdvancedBlock } from '@wa-dev/email-editor-blocks-react';
import { Iteration } from '../Iteration';
import { Condition } from '../Condition';

export interface CollapseWrapperProps {
  defaultActiveKey: string[];
  children: React.ReactNode | React.ReactElement;
}

export const CollapseWrapper: React.FC<CollapseWrapperProps> = props => {
  const { enabledLogic } = useEditorProps();
  const [activeKeys, setActiveKeys] = useState<string[]>(props.defaultActiveKey);

  const { focusBlock } = useBlock();
  const value = focusBlock?.data.value;

  const isAdvancedBlockType = isAdvancedBlock(focusBlock?.type);

  const iterationEnabled =
    isAdvancedBlockType && Boolean(value?.iteration && value?.iteration?.enabled);

  const conditionEnabled =
    isAdvancedBlockType && Boolean(value?.condition && value?.condition?.enabled);

  const onChange = useMemoizedFn((value: string | string[]) => {
    setActiveKeys(Array.isArray(value) ? value : value ? [value] : []);
  });

  useEffect(() => {
    if (!isAdvancedBlockType) return;

    if (iterationEnabled) {
      setActiveKeys(keys => (keys.includes('Iteration') ? keys : [...keys, 'Iteration']));
    } else {
      setActiveKeys(keys => keys.filter(k => k !== 'Iteration'));
    }
  }, [iterationEnabled, isAdvancedBlockType]);

  useEffect(() => {
    if (!isAdvancedBlockType) return;

    if (conditionEnabled) {
      setActiveKeys(keys => (keys.includes('Condition') ? keys : [...keys, 'Condition']));
    } else {
      setActiveKeys(keys => keys.filter(k => k !== 'Condition'));
    }
  }, [conditionEnabled, isAdvancedBlockType]);

  return (
    <div className="ee-attr-collapse w-full px-4 pb-8 pt-1">
      <Collapse
        bordered={false}
        onChange={onChange}
        activeKey={activeKeys}
      >
        {props.children}
        {enabledLogic && (
          <>
            <Iteration />
            <Condition />
          </>
        )}
      </Collapse>
    </div>
  );
};
