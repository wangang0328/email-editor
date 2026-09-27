import { IEmailTemplate } from '@/typings';
import { Form, useForm, useFormState, useField } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import React, { useMemo, useEffect, useState } from 'react';
import { BlocksProvider } from '..//BlocksProvider';
import { HoverIdxProvider } from '../HoverIdxProvider';
import { PropsProvider, PropsProviderProps } from '../PropsProvider';
import { RecordProvider } from '../RecordProvider';
import { ScrollProvider } from '../ScrollProvider';
import { Config, FormApi, FormState } from 'final-form';
import setFieldTouched from 'final-form-set-field-touched';
import { FocusBlockLayoutProvider } from '../FocusBlockLayoutProvider';
import { BlockIndexProvider } from '../BlockIndexProvider';
import { PreviewEmailProvider } from '../PreviewEmailProvider';
import { LanguageProvider } from '../LanguageProvider';
import { overrideErrorLog, restoreErrorLog } from '@/utils/logger';
import {
  ensurePageBlockStableIds,
  perfCounter,
  perfDebugHintOnce,
  perfResetSession,
} from '@wa-dev/email-editor-shared';
import { cloneDeep } from 'lodash-es';

export interface EmailEditorProviderProps<T extends IEmailTemplate = any>
  extends Omit<PropsProviderProps, 'children'> {
  data: T;
  children: (
    props: FormState<T>,
    helper: FormApi<IEmailTemplate, Partial<IEmailTemplate>>,
  ) => React.ReactNode;
  onSubmit?: Config<IEmailTemplate, Partial<IEmailTemplate>>['onSubmit'];
  validationSchema?: Config<IEmailTemplate, Partial<IEmailTemplate>>['validate'];
}

export const EmailEditorProvider = <T extends any>(
  props: EmailEditorProviderProps & T,
) => {
  const { data, children, onSubmit = () => {}, validationSchema } = props;

  const initialValues = useMemo(() => {
    const content = data.content ? cloneDeep(data.content) : data.content;
    if (content) {
      ensurePageBlockStableIds(content);
    }
    return {
      subject: data.subject,
      subTitle: data.subTitle,
      content,
    };
  }, [data.subject, data.subTitle, data.content]);

  useEffect(() => {
    perfResetSession();
    perfDebugHintOnce();
    overrideErrorLog();
    return () => {
      restoreErrorLog();
    };
  }, []);

  if (!initialValues.content) return null;

  return (
    <Form<IEmailTemplate>
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
      validate={validationSchema}
      mutators={{ ...arrayMutators, setFieldTouched: setFieldTouched as any }}
      subscription={{ submitting: true, pristine: true }}
    >
      {() => (
        <>
          <PropsProvider {...props}>
            <LanguageProvider locale={props.locale}>
              <BlocksProvider>
                <RecordProvider>
                  <PreviewEmailProvider>
                    <HoverIdxProvider>
                      <ScrollProvider>
                        <BlockIndexProvider>
                          <FocusBlockLayoutProvider>
                            <FormWrapper children={children} />
                          </FocusBlockLayoutProvider>
                        </BlockIndexProvider>
                      </ScrollProvider>
                    </HoverIdxProvider>
                  </PreviewEmailProvider>
                </RecordProvider>
              </BlocksProvider>
            </LanguageProvider>
          </PropsProvider>
          <RegisterFields />
          <FormPerfWatcher />
        </>
      )}
    </Form>
  );
};

function FormPerfWatcher() {
  const formState = useFormState<IEmailTemplate>();
  const isFirst = React.useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    perfCounter('formState.change');
  }, [formState]);

  return null;
}

function FormWrapper({ children }: { children: EmailEditorProviderProps['children'] }) {
  const data = useFormState<IEmailTemplate>();
  const helper = useForm<IEmailTemplate>();
  return <>{children(data, helper)}</>;
}

// final-form bug https://github.com/final-form/final-form/issues/169

const RegisterFields = React.memo(() => {
  const { touched } = useFormState<IEmailTemplate>();
  const [touchedMap, setTouchedMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (touched) {
      Object.keys(touched)
        .filter(key => touched[key])
        .forEach(key => {
          setTouchedMap(obj => {
            obj[key] = true;
            return { ...obj };
          });
        });
    }
  }, [touched]);

  return (
    <>
      {Object.keys(touchedMap).map(key => {
        return (
          <RegisterField
            key={key}
            name={key}
          />
        );
      })}
    </>
  );
});

function RegisterField({ name }: { name: string }) {
  useField(name);
  return <></>;
}
