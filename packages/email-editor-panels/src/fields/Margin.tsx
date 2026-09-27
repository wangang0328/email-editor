import { t } from '@lingui/core/macro';
import React from 'react';
import { TextField } from '@panels/form';
import { useFocusIdx, Stack, TextStyle } from '@wa-dev/email-editor-editor';
import type { AttributeFormItemProps } from './types';

export function Margin({ formItem }: AttributeFormItemProps) {
  const { focusIdx } = useFocusIdx();

  return (
    <Stack vertical spacing='extraTight'>
      <TextStyle size='large'>{t`外边距`}</TextStyle>
      <Stack wrap={false}>
        <Stack.Item fill>
          <TextField
            label={t`顶部`}
            quickchange
            name={`${focusIdx}.attributes.marginTop`}
            inline
            formItem={formItem}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            label={t`底部`}
            quickchange
            name={`${focusIdx}.attributes.marginBottom`}
            inline
            formItem={formItem}
          />
        </Stack.Item>
      </Stack>

      <Stack wrap={false}>
        <Stack.Item fill>
          <TextField
            label={t`左侧`}
            quickchange
            name={`${focusIdx}.attributes.marginLeft`}
            inline
            formItem={formItem}
          />
        </Stack.Item>
        <Stack.Item fill>
          <TextField
            label={t`右侧`}
            quickchange
            name={`${focusIdx}.attributes.marginRight`}
            inline
            formItem={formItem}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
