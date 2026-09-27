import { Collapse, Input, Message } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { BasicType, getPageIdx, getParentByIdx, IBlockData, JsonToMjml } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '../utils/blockRegistry';
import {
  useBlock,
  useFocusIdx,
  useEditorContext,
  useEditorProps,
} from '@wa-dev/email-editor-editor';
import { useFocusBlockData } from '@extensions/hooks/useFocusBlockData';
import { cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo } from 'react';
import { MjmlToJson } from '@extensions/utils/MjmlToJson';
import styles from './index.module.scss';

export function SourceCodePanel({ jsonReadOnly, mjmlReadOnly }: { jsonReadOnly: boolean; mjmlReadOnly: boolean }) {
  const { setValueByIdx, values } = useBlock();
  const { focusIdx } = useFocusIdx();
  const focusBlock = useFocusBlockData();

  const { pageData } = useEditorContext();
  const { mergeTags } = useEditorProps();

  const code = useMemo(() => {
    if (!focusBlock) return '';
    return JSON.stringify(focusBlock, null, 2) || '';
  }, [focusBlock]);

  const mjmlCode = useMemo(() => {
    if (!focusBlock) return '';
    return JsonToMjml({
      idx: focusIdx,
      data: focusBlock,
      context: pageData,
      mode: 'production',
      dataSource: cloneDeep(mergeTags),
    });
  }, [focusBlock, focusIdx, pageData, mergeTags]);

  const onChangeCode = useMemoizedFn((event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!jsonReadOnly) {
      try {
        const parseValue = JSON.parse(
          JSON.stringify(eval('(' + event.target.value + ')')),
        ) as IBlockData;

        const block = getBlockByType(parseValue.type);
        if (!block) {
          throw new Error(t`内容无效`);
        }
        if (
          !parseValue.data ||
          !parseValue.data.value ||
          !parseValue.attributes ||
          !Array.isArray(parseValue.children)
        ) {
          throw new Error(t`内容无效`);
        }
        setValueByIdx(focusIdx, parseValue);
      } catch (error: any) {
        Message.error(error?.message || error);
      }
    }
  });

  const onMjmlChange = useMemoizedFn((event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!mjmlReadOnly) {
      try {
        const parseValue = MjmlToJson(event.target.value);
        if (parseValue.type !== BasicType.PAGE) {
          const parentBlock = getParentByIdx(values, focusIdx)!;
          const parseBlock = getBlockByType(parseValue.type);

          if (parentBlock?.type && !parseBlock?.validParentType.includes(parentBlock.type)) {
            throw new Error(t`内容无效`);
          }
        } else if (focusIdx !== getPageIdx()) {
          throw new Error(t`内容无效`);
        }

        setValueByIdx(focusIdx, parseValue);
      } catch (error) {
        Message.error(t`内容无效`);
      }
    }
  });

  if (!focusBlock) return null;

  const codeEditorWrap: React.CSSProperties = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  }

  const codeTextAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 280,
    display: 'block',
  }

  return (
    <Collapse style={{ width: '100%' }}>
      <Collapse.Item
        name='json'
        destroyOnHide
        header={t`JSON 源码`}
        contentStyle={{ padding: '8px 12px', width: '100%', boxSizing: 'border-box' }}
      >
        <div style={codeEditorWrap}>
          <Input.TextArea
            key={`json-${focusIdx}`}
            defaultValue={code}
            autoSize={{ minRows: 14, maxRows: 28 }}
            onBlur={onChangeCode}
            readOnly={jsonReadOnly}
            className={styles.customTextArea}
            style={codeTextAreaStyle}
          />
        </div>
      </Collapse.Item>
      <Collapse.Item
        name='mjml'
        destroyOnHide
        header={t`MJML 源码`}
        contentStyle={{ padding: '8px 12px', width: '100%', boxSizing: 'border-box' }}
      >
        <div style={codeEditorWrap}>
          <Input.TextArea
            key={`mjml-${focusIdx}`}
            defaultValue={mjmlCode}
            autoSize={{ minRows: 14, maxRows: 28 }}
            onBlur={onMjmlChange}
            readOnly={mjmlReadOnly}
            className={styles.customTextArea}
            style={codeTextAreaStyle}
          />
        </div>
      </Collapse.Item>
    </Collapse>
  );
}
