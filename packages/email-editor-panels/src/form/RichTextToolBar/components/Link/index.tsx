import { Popover } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import type { PopoverProps } from '@wa-dev/email-editor-ui';
import { useMemoizedFn } from 'ahooks';
import React, { useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import { Link as LinkIcon } from 'lucide-react';
import { SearchField, SwitchField } from '@panels/form';
import { ToolItem } from '../ToolItem';
import { EMAIL_BLOCK_CLASS_NAME } from '@wa-dev/email-editor-blocks-react';
import styleText from '../../styles/ToolsPopover.css?inline';
import { unlockRichTextToolbar } from '../../../RichTextField/richTextToolbarInteraction';
import { useRichTextToolbarPopover } from '../../hooks/useRichTextToolbarPopover';

export interface LinkParams {
  link: string;
  blank: boolean;
  underline: boolean;
  linkNode: HTMLAnchorElement | null;
}

export interface LinkProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: (val: LinkParams) => void;
  getPopupContainer: () => HTMLElement;
}

function getAnchorElement(
  node: Node | null,
): HTMLAnchorElement | null {
  if (!node) return null;
  if (node instanceof HTMLAnchorElement) {
    return node;
  }
  if (node instanceof Element && node.classList.contains(EMAIL_BLOCK_CLASS_NAME)) return null;

  return getAnchorElement(node.parentNode);
}

export function getLinkNode(
  currentRange: Range | null | undefined,
): HTMLAnchorElement | null {
  let linkNode: HTMLAnchorElement | null = null;
  if (!currentRange) return null;
  linkNode = getAnchorElement(currentRange.startContainer);
  return linkNode;
}

export function Link(props: LinkProps) {
  const { currentRange, onChange, getPopupContainer } = props;
  const [visible, setVisible] = useState(false);
  const onPopoverVisibleChange = useRichTextToolbarPopover();

  const initialValues = useMemo((): LinkParams => {
    let link = '';
    let blank = true;
    let underline = true;
    let linkNode: HTMLAnchorElement | null = getLinkNode(currentRange);
    if (linkNode) {
      link = linkNode.getAttribute('href') || '';
      blank = linkNode.getAttribute('target') === '_blank';
      underline = linkNode.style.textDecoration === 'underline';
    }
    return {
      link,
      blank,
      underline,
      linkNode,
    };
  }, [currentRange]);

  const onSubmit = useMemoizedFn((values: LinkParams) => {
    onChange(values);
    setVisible(false);
    unlockRichTextToolbar();
  });

  const onVisibleChange = useMemoizedFn((v: boolean) => {
    setVisible(v);
    onPopoverVisibleChange(v);
  });

  return (
    <Form
      key={initialValues.link}
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => {
        return (
          <Popover
            trigger='click'
            color='#fff'
            position='tl'
            className='ee-tools-popover email-editor-toolbar-dropdown'
            popupVisible={visible}
            onVisibleChange={onVisibleChange}
            getPopupContainer={getPopupContainer}
            content={(
              <>
                <style>{styleText}</style>
                <div style={{ color: '#333', minWidth: 400, padding: '4px 0' }}>
                  <SearchField
                    size='small'
                    name='link'
                    label={t`链接`}
                    labelHidden
                    searchButton={t`应用`}
                    placeholder={t`https://www.example.com`}
                    onSearch={() => handleSubmit()}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                      marginTop: 8,
                      flexWrap: 'nowrap',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12 }}>{t`打开方式`}</span>
                      <SwitchField
                        size='small'
                        labelHidden
                        name='blank'
                        checkedText={t`新窗口`}
                        uncheckedText={t`当前窗口`}
                        textInside
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12 }}>{t`下划线`}</span>
                      <SwitchField
                        size='small'
                        labelHidden
                        name='underline'
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          >
            <ToolItem
              asPopoverTrigger
              isActive={Boolean(initialValues.link)}
              title={t`链接`}
              icon={<LinkIcon size={16} />}
            />
          </Popover>
        );
      }}
    </Form>
  );
}
