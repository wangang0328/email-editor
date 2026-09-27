import type { FormItemProps } from '@wa-dev/email-editor-ui';

export type AttributeFormItemProps = {
  formItem?: FormItemProps;
};

export type AttributeTitleFormItemProps = AttributeFormItemProps & {
  title?: string;
};
