import { IPage } from '@wa-dev/email-editor-blocks-react';

export interface IEmailTemplate {
  content: IPage;
  subject: string;
  subTitle: string;
}

declare global {
  function t(key: string): string;
  function t(key: string, placeholder: React.ReactNode): React.JSX.Element;

  interface Window {
    // translation

    t: (key: string, placeholder?: React.ReactNode) => React.JSX.Element;
  }
}
