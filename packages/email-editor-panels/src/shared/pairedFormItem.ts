import type { FormItemProps } from '@wa-dev/email-editor-ui';

/** 双列表单项：label 最多两行、控件区 32px 并垂直居中 */
export const pairedFormItem: FormItemProps = {
  labelAlign: 'top',
  className: '[&>div:first-child]:line-clamp-2',
  wrapperCol: {
    style: {
      minHeight: 32,
      display: 'flex',
      alignItems: 'center',
    },
  },
};

/** 属性面板分区内的垂直间距约定 */
export const panelVerticalSpaceProps = {
  direction: 'vertical' as const,
  size: 'small' as const,
  align: 'start' as const,
  style: { width: '100%' as const },
};
