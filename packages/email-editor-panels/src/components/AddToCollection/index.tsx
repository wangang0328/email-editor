import { Modal } from '@wa-dev/email-editor-ui';
import { t } from '@lingui/core/macro';
import { Stack, useBlock, useEditorProps } from '@wa-dev/email-editor-editor';
import React from 'react';
import { Form } from 'react-final-form';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploaderField, TextAreaField, TextField } from '@panels/form';

export const AddToCollection: React.FC<{
  visible: boolean;
  setVisible: (v: boolean) => void;
}> = ({ visible, setVisible }) => {
  const { focusBlock: focusBlockData } = useBlock();
  const { onAddCollection, onUploadImage } = useEditorProps();

  const onSubmit = (values: {
    label: string;
    helpText: string;
    thumbnail: string;
  }) => {
    if (!values.label) return;
    const uuid = uuidv4();
    onAddCollection?.({
      label: values.label,
      helpText: values.helpText,
      data: focusBlockData!,
      thumbnail: values.thumbnail,
      id: uuid,
    });
    setVisible(false);
  };

  return (
    <Form
      initialValues={{ label: '', helpText: '', thumbnail: '' }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <Modal
          maskClosable={false}
          style={{ zIndex: 2000 }}
          visible={visible}
          title={t`添加到收藏`}
          onOk={() => {
            void handleSubmit();
          }}
          onCancel={() => setVisible(false)}
        >
          <Stack vertical>
            <Stack.Item />
            <TextField
              label={t`标题`}
              name='label'
              validate={(val: string) => {
                if (!val) return t`标题为必填项`;
                return undefined;
              }}
            />
            <TextAreaField label={t`描述`} name='helpText' />
            <ImageUploaderField
              label={t`缩略图`}
              name={'thumbnail'}
              uploadHandler={onUploadImage}
              validate={(val: string) => {
                if (!val) return t`缩略图为必填项`;
                return undefined;
              }}
            />
          </Stack>
        </Modal>
      )}
    </Form>
  );
};
