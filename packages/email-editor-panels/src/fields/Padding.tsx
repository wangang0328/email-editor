import { t } from '@lingui/core/macro';
import { CircleX, Link2, Unlink2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { InputWithUnitField } from '@panels/form';
import { useFocusIdx, Stack, useBlock, TextStyle } from '@wa-dev/email-editor-editor';
import { createBlockDataByType } from '@wa-dev/email-editor-blocks-react';
import { Form, FormSpy, useForm } from 'react-final-form';
import { Button, Space, Tooltip, type FormItemProps } from '@wa-dev/email-editor-ui';
import { get } from 'lodash-es';
import { pixelAdapter } from '../shared/adapter';
import { useMemoizedFn } from 'ahooks';

export interface PaddingProps {
  title?: string;
  /** 是否显示区块标题，嵌套在折叠面板内时可设为 false */
  showTitle?: boolean;
  attributeName?: 'padding' | 'inner-padding' | 'text-padding';
  name?: string;
  showResetAll?: boolean;
  formItem?: FormItemProps;
}

function stripPx(val: string) {
  return val?.replace(/px$/i, '').trim() ?? '';
}

function PaddingLockButton({
  locked,
  onClick,
  title,
}: {
  locked: boolean;
  onClick: () => void;
  title: string;
}) {
  const Icon = locked ? Link2 : Unlink2;
  return (
    <Tooltip content={title}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--color-border-2,#e5e6eb)] bg-[var(--color-bg-2,#fff)] text-[var(--color-text-2,#4e5969)] transition-colors hover:border-[var(--color-primary,#165dff)] hover:text-[var(--color-primary,#165dff)]"
        aria-pressed={locked}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}

const paddingFieldProps = {
  autoComplete: 'off' as const,
  config: pixelAdapter,
  suffix: 'px',
  type: 'number' as const,
  style: { width: '100%' } as const,
};

function PaddingField({
  label,
  name,
  formItem,
}: {
  label: string;
  name: string;
  formItem: FormItemProps;
}) {
  return (
    <div className="w-full min-w-0 [&_.ee-form-item]:mb-0 [&_.ee-form-item]:w-full [&_.ee-input-wrapper]:!w-full [&_input]:!w-full">
      <InputWithUnitField
        label={label}
        name={name}
        formItem={formItem}
        debounceTime={0}
        {...paddingFieldProps}
      />
    </div>
  );
}

export function Padding(props: PaddingProps = {}) {
  const {
    title = t`内边距`,
    showTitle = true,
    attributeName = 'padding',
    name,
    showResetAll,
    formItem: formItemFromProps,
  } = props;

  const paddingFormItem = useMemo(
    () =>
      ({
        labelAlign: 'top',
        ...formItemFromProps,
      }) as FormItemProps,
    [formItemFromProps],
  );

  const { focusBlock, change, values } = useBlock();
  const { focusIdx } = useFocusIdx();

  const type = focusBlock && focusBlock.type;

  const defaultConfig = useMemo(
    () => (type ? createBlockDataByType(type) : undefined),
    [type],
  );

  const paddingValue: string | undefined = useMemo(() => {
    if (name) {
      return get(values, name);
    }
    return focusBlock?.attributes[attributeName];
  }, [attributeName, focusBlock?.attributes, name, values]);

  const defaultPaddingValue: string | undefined = useMemo(() => {
    if (name) {
      return null;
    }
    return defaultConfig?.attributes[attributeName];
  }, [attributeName, defaultConfig?.attributes, name]);

  const paddingFormValues = useMemo(() => {
    const paddingList = paddingValue?.split(' ');
    const defaultPaddingList = defaultPaddingValue?.split(' ');

    const top = paddingList ? paddingList[0] : defaultPaddingList?.[0] || '';
    const right = paddingList ? paddingList[1] : defaultPaddingList?.[1] || '';
    const bottom = paddingList ? paddingList[2] : defaultPaddingList?.[2] || '';
    const left = paddingList ? paddingList[3] : defaultPaddingList?.[3] || '';

    return { top, left, bottom, right };
  }, [defaultPaddingValue, paddingValue]);

  const [verticalLocked, setVerticalLocked] = useState(
    () => stripPx(paddingFormValues.top) === stripPx(paddingFormValues.bottom),
  );
  const [horizontalLocked, setHorizontalLocked] = useState(
    () => stripPx(paddingFormValues.left) === stripPx(paddingFormValues.right),
  );

  useEffect(() => {
    setVerticalLocked(stripPx(paddingFormValues.top) === stripPx(paddingFormValues.bottom));
    setHorizontalLocked(stripPx(paddingFormValues.left) === stripPx(paddingFormValues.right));
  }, [focusIdx, paddingFormValues.top, paddingFormValues.bottom, paddingFormValues.left, paddingFormValues.right]);

  const onChancePadding = useCallback(
    (val: string) => {
      if (name) {
        change(name, val);
      } else {
        change(`${focusIdx}.attributes[${attributeName}]`, val);
      }
    },
    [name, change, focusIdx, attributeName],
  );

  const onResetPadding = useCallback(() => {
    const reset = '0px 0px 0px 0px';
    if (name) {
      change(name, reset);
    } else {
      change(`${focusIdx}.attributes[${attributeName}]`, reset);
    }
  }, [name, change, focusIdx, attributeName]);

  return (
    <Form<{ top: string; right: string; left: string; bottom: string }>
      initialValues={paddingFormValues}
      subscription={{ submitting: true, pristine: true }}
      enableReinitialize
      onSubmit={() => {}}
    >
      {() => (
        <>
          <Stack vertical spacing='extraTight' className="w-full">
            {showTitle ? (
              <Space align='center'>
                <TextStyle variation='strong'>{title}</TextStyle>
                {showResetAll && (
                  <Tooltip content={t`清除全部内边距`}>
                    <Button
                      onClick={onResetPadding}
                      size='mini'
                      icon={<CircleX size={12} />}
                    />
                  </Tooltip>
                )}
              </Space>
            ) : showResetAll ? (
              <div className="flex justify-end">
                <Tooltip content={t`清除全部内边距`}>
                  <Button
                    onClick={onResetPadding}
                    size='mini'
                    icon={<CircleX size={12} />}
                  />
                </Tooltip>
              </div>
            ) : null}

            <PaddingAxisRow
              locked={verticalLocked}
              lockTitle={verticalLocked ? t`解锁上/下` : t`锁定上/下`}
              onToggleLock={() => setVerticalLocked(v => !v)}
              syncFieldOnLock='bottom'
              sourceFieldOnLock='top'
              primaryLabel={t({ context: 'padding.side', message: '上' })}
              secondaryLabel={t({ context: 'padding.side', message: '下' })}
              mergedLabel={t({ context: 'padding.side', message: '上/下' })}
              primaryName='top'
              secondaryName='bottom'
              formItem={paddingFormItem}
            />

            <PaddingAxisRow
              locked={horizontalLocked}
              lockTitle={horizontalLocked ? t`解锁左/右` : t`锁定左/右`}
              onToggleLock={() => setHorizontalLocked(v => !v)}
              syncFieldOnLock='right'
              sourceFieldOnLock='left'
              primaryLabel={t({ context: 'padding.side', message: '左' })}
              secondaryLabel={t({ context: 'padding.side', message: '右' })}
              mergedLabel={t({ context: 'padding.side', message: '左/右' })}
              primaryName='left'
              secondaryName='right'
              formItem={paddingFormItem}
            />
          </Stack>

          <PaddingChangeWrapper
            onChange={onChancePadding}
            verticalLocked={verticalLocked}
            horizontalLocked={horizontalLocked}
          />
        </>
      )}
    </Form>
  );
}

function PaddingAxisRow({
  locked,
  lockTitle,
  onToggleLock,
  syncFieldOnLock,
  sourceFieldOnLock,
  primaryLabel,
  secondaryLabel,
  mergedLabel,
  primaryName,
  secondaryName,
  formItem,
}: {
  locked: boolean;
  lockTitle: string;
  onToggleLock: () => void;
  syncFieldOnLock: 'bottom' | 'right';
  sourceFieldOnLock: 'top' | 'left';
  primaryLabel: string;
  secondaryLabel: string;
  mergedLabel: string;
  primaryName: 'top' | 'left';
  secondaryName: 'bottom' | 'right';
  formItem: FormItemProps;
}) {
  const form = useForm();

  const handleToggle = useMemoizedFn(() => {
    if (!locked) {
      const source = form.getFieldState(sourceFieldOnLock)?.value;
      if (source != null) {
        form.change(syncFieldOnLock, source);
      }
    }
    onToggleLock();
  });

  return (
    <div className="flex w-full items-end gap-2">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
        {locked ? (
          <div className="col-span-2 min-w-0 w-full">
            <PaddingField label={mergedLabel} name={primaryName} formItem={formItem} />
          </div>
        ) : (
          <>
            <div className="min-w-0 w-full">
              <PaddingField label={primaryLabel} name={primaryName} formItem={formItem} />
            </div>
            <div className="min-w-0 w-full">
              <PaddingField label={secondaryLabel} name={secondaryName} formItem={formItem} />
            </div>
          </>
        )}
      </div>
      <PaddingLockButton locked={locked} onClick={handleToggle} title={lockTitle} />
    </div>
  );
}

const PaddingChangeWrapper: React.FC<{
  onChange: (val: string) => void;
  verticalLocked: boolean;
  horizontalLocked: boolean;
}> = ({ onChange, verticalLocked, horizontalLocked }) => {
  const verticalLockedRef = React.useRef(verticalLocked);
  const horizontalLockedRef = React.useRef(horizontalLocked);
  verticalLockedRef.current = verticalLocked;
  horizontalLockedRef.current = horizontalLocked;

  const syncPadding = useMemoizedFn(
    (formValues: { top?: string; right?: string; bottom?: string; left?: string }) => {
      const resolvedTop = formValues.top || '0px';
      const resolvedBottom = verticalLockedRef.current
        ? resolvedTop
        : formValues.bottom || '0px';
      const resolvedLeft = formValues.left || '0px';
      const resolvedRight = horizontalLockedRef.current
        ? resolvedLeft
        : formValues.right || '0px';
      onChange([resolvedTop, resolvedRight, resolvedBottom, resolvedLeft].join(' '));
    },
  );

  return (
    <FormSpy
      subscription={{ values: true }}
      onChange={({ values }) => {
        syncPadding(values);
      }}
    />
  );
};
