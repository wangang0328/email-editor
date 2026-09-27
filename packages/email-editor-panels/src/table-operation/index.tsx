import { cloneDeep } from 'lodash-es';
import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import TableColumnTool from './tableTool';
import { getShadowRoot, useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';

function getTablePortalContainer(shadowRoot: ShadowRoot): HTMLElement | null {
  const body = shadowRoot.querySelector('body');
  if (body instanceof HTMLElement) {
    return body;
  }

  const mjBody = shadowRoot.querySelector('.mj-body');
  if (mjBody instanceof HTMLElement) {
    return mjBody;
  }

  const first = shadowRoot.firstElementChild;
  return first instanceof HTMLElement ? first : null;
}

export function TableOperation() {
  const shadowRoot = getShadowRoot();
  const portalContainer = useMemo(
    () => (shadowRoot ? getTablePortalContainer(shadowRoot) : null),
    [shadowRoot],
  );
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change } = useBlock();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const tool = useRef<TableColumnTool | undefined>(undefined);

  useEffect(() => {
    if (!portalContainer) {
      return;
    }

    const borderTool = {
      top: topRef.current,
      bottom: bottomRef.current,
      left: leftRef.current,
      right: rightRef.current,
    };
    tool.current = new TableColumnTool(borderTool as any, portalContainer);
    return () => {
      tool.current?.destroy();
    };
  }, [portalContainer]);

  useEffect(() => {
    if (tool.current) {
      tool.current.changeTableData = (data: any[][]) => {
        change(`${focusIdx}.data.value.tableSource`, cloneDeep(data));
      };
      tool.current.tableData = cloneDeep(focusBlock?.data?.value?.tableSource || []);
    }
  }, [change, focusBlock, focusIdx]);

  if (!portalContainer) {
    return null;
  }

  return createPortal(
    <div>
      <div ref={topRef} />
      <div ref={bottomRef} />
      <div ref={leftRef} />
      <div ref={rightRef} />
    </div>,
    portalContainer,
  );
}
