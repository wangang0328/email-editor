import { t } from '@lingui/core/macro';
import { FieldArray } from 'react-final-form-arrays';
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { TextField } from '.';
import { Button } from '@wa-dev/email-editor-ui';
import { Stack, TextStyle, useBlock, useFocusIdx } from '@wa-dev/email-editor-editor';
import { Help } from '@panels/shared/UI/Help';
import { IPage } from '@wa-dev/email-editor-blocks-react';

export function AddFont() {
  const { focusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const value: IPage['data']['value'] = focusBlock?.data.value;
  return (
    <FieldArray
      name={`${focusIdx}.data.value.fonts`}
      render={arrayHelpers => {
        return (
          <div>
            <Stack
              vertical
              spacing='tight'
            >
              <Stack distribution='equalSpacing' alignment='center'>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TextStyle variation='strong'>{t`导入字体`}</TextStyle>
                  <Help title={t`指向托管的 CSS 文件`} />
                </span>
                <Stack>
                  <Button
                    size='small'
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => arrayHelpers.fields.push({ name: '', href: '' })}
                  />
                </Stack>
              </Stack>

              <Stack
                vertical
                spacing='extraTight'
              >
                {value.fonts?.map((item, index) => {
                  return (
                    <div key={index}>
                      <Stack
                        alignment='center'
                        wrap={false}
                      >
                        <Stack.Item fill>
                          <TextField
                            name={`${focusIdx}.data.value.fonts.${index}.name`}
                            label={t`名称`}
                          />
                        </Stack.Item>
                        <Stack.Item fill>
                          <TextField
                            name={`${focusIdx}.data.value.fonts.${index}.href`}
                            label={t`链接地址`}
                          />
                        </Stack.Item>
                        <Stack
                          vertical
                          spacing='loose'
                        >
                          <Stack.Item />
                          <Button
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => arrayHelpers.fields.remove(index)}
                          />
                        </Stack>
                      </Stack>
                    </div>
                  );
                })}
              </Stack>
            </Stack>
          </div>
        );
      }}
    />
  );
}
