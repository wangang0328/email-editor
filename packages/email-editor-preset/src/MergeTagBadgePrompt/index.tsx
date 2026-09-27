import { t } from '@lingui/core/macro';
import {
  useEditorContext,
  useEditorProps,
  getShadowRoot,
  getBlockNodeByChildEle,
  IconFont,
  useRefState,
  getEditorRoot,
} from '@wa-dev/email-editor-editor';
import { get } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import stylesText from './MergeTagBadge.scss?inline';
import { classnames } from '@wa-dev/email-editor-panels';
import { useSelectionRange } from '@wa-dev/email-editor-panels';

const removeAllActiveBadge = () => {
  getShadowRoot()
    .querySelectorAll('.easy-email-merge-tag')
    .forEach((item) => {
      item.classList.remove('easy-email-merge-tag-focus');
    });

  const popoverNode = getShadowRoot().querySelectorAll(
    '.easy-email-merge-tag-popover'
  );
  if (popoverNode) {
  }
};

export function MergeTagBadgePrompt() {
  const { initialized } = useEditorContext();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { onChangeMergeTag, mergeTags } = useEditorProps();
  const [text, setText] = useState('');
  const { setRangeByElement } = useSelectionRange();

  const root = initialized && getShadowRoot();
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const targetRef = useRefState(target);

  const textContainer = getBlockNodeByChildEle(target);

  const focusMergeTag = useMemoizedFn((ele: HTMLElement) => {
    if (!ele) return;

    setRangeByElement(ele);
  });

  useEffect(() => {

    const onBlur = (ev: MouseEvent) => {
      if (ev.target === getEditorRoot()) {
        return;
      }
      setTarget(null);
    };
    window.addEventListener('click', onBlur);
    return () => {
      window.removeEventListener('click', onBlur);
    };
  }, [targetRef, popoverRef]);

  const onClose = useMemoizedFn(() => {
    let ele = targetRef.current;

    setTimeout(() => {
      if (!ele) return;
      focusMergeTag(ele);
    }, 100);

    setTarget(null);
  });

  useEffect(() => {
    if (!root) return;
    const onClick: EventListenerOrEventListenerObject = (e) => {
      removeAllActiveBadge();
      const target = e.target;
      if (
        target instanceof HTMLInputElement &&
        target.classList.contains('easy-email-merge-tag')
      ) {
        target.classList.add('easy-email-merge-tag-focus');
        const namePath = target.value;
        if (!onChangeMergeTag) {
          focusMergeTag(target);
          return;
        }
        setText(get(mergeTags, namePath, ''));
        setTarget(target);

      } else {
        if (popoverRef.current?.contains(e.target as any)) return;
        setTarget(null);

      }
    };

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
    };
  }, [focusMergeTag, mergeTags, onChangeMergeTag, root]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useMemoizedFn(ev => {
    setText(ev.target.value);
  });

  const onSave = useMemoizedFn(() => {
    if (!(target instanceof HTMLInputElement)) return;
    onChangeMergeTag?.(target.value, text);
    onClose();
  });

  const onClick: React.MouseEventHandler<HTMLDivElement> = useMemoizedFn(ev => {
    ev.stopPropagation();
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {

      if (e.code?.toLocaleLowerCase() === 'escape') {
        onClose();
      }

    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, onSave]);

  return (
    <>

      {root && createPortal(<style>{stylesText}</style>, root as any)}
      {textContainer && createPortal(
        <div ref={popoverRef} onClick={onClick} className={classnames('easy-email-merge-tag-popover')}>
          <div className='easy-email-merge-tag-popover-container'>
            <h3>
              <span>{t`默认值`}</span>
              <IconFont icon={X} style={{ color: 'rgb(92, 95, 98)' }} onClick={onClose} />
            </h3>
            <div className={'easy-email-merge-tag-popover-desc'}>
              <p>
                {t`如果个性化文本值不可用，则显示默认值。`}
              </p>
              <div className='easy-email-merge-tag-popover-desc-label'>
                <input autoFocus value={text} onChange={onChange} type="text" autoComplete='off' maxLength={40} />
                <div className='easy-email-merge-tag-popover-desc-label-count'>
                  {text.length}/40
                </div>
              </div>
              <div className='easy-email-merge-tag-popover-desc-label-button'>
                <button onClick={onSave}>{t({ context: 'mergeTag.save', message: '保存' })}</button>
              </div>
            </div>
          </div>

        </div>, textContainer)}
    </>
  );
}
