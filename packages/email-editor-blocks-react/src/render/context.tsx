import React, { useContext } from 'react';
// React namespace required for classic JSX runtime in tests
import type { IBlockData } from '@blocks/typings';

export type EmailRenderProps = {
  children?: React.ReactNode;
  context?: IBlockData;
  dataSource?: Record<string, unknown>;
  mode: 'production' | 'testing';
};

export const EmailRenderContext = React.createContext<EmailRenderProps>(
  {} as EmailRenderProps
);

export const EmailRenderProvider: React.FC<EmailRenderProps> = (props) => (
  <EmailRenderContext.Provider value={props}>
    {props.children}
  </EmailRenderContext.Provider>
);

export const useEmailRenderContext = () => useContext(EmailRenderContext);
