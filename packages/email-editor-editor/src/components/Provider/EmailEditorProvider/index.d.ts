import { IEmailTemplate } from '@/typings';
import React from 'react';
import { PropsProviderProps } from '../PropsProvider';
import { Config, FormApi, FormState } from 'final-form';
export interface EmailEditorProviderProps<T extends IEmailTemplate = any> extends Omit<PropsProviderProps, 'children'> {
    data: T;
    children: (props: FormState<T>, helper: FormApi<IEmailTemplate, Partial<IEmailTemplate>>) => React.ReactNode;
    onSubmit?: Config<IEmailTemplate, Partial<IEmailTemplate>>['onSubmit'];
    validationSchema?: Config<IEmailTemplate, Partial<IEmailTemplate>>['validate'];
}
export declare const EmailEditorProvider: <T extends any>(props: EmailEditorProviderProps & T) => React.JSX.Element;
//# sourceMappingURL=index.d.ts.map