import { Button, Tooltip } from '@panels/panel-deps';
import { t } from '@lingui/core/macro';
import React, { useState } from 'react';
import { useFocusIdx } from '@wa-dev/email-editor-editor';
import { Code } from 'lucide-react';
import { TextAreaField } from '@panels/panel-deps';
import { AttributesPanelWrapper } from '@panels/panel-deps';

import { HtmlEditor } from '@panels/panel-deps';

export function RawPanel() {
  const { focusIdx } = useFocusIdx();
  const [visible, setVisible] = useState(false);
  return (
    <AttributesPanelWrapper
      style={{ padding: 20 }}
      extra={(
        <Tooltip content={t`HTML 模式`}>
          <Button
            onClick={() => setVisible(true)}
            icon={<Code size={16} />}
          />
        </Tooltip>
      )}
    >
      <TextAreaField
        label=''
        name={`${focusIdx}.data.value.content`}
        rows={5}
      />
      <HtmlEditor
        visible={visible}
        setVisible={setVisible}
      />
    </AttributesPanelWrapper>
  );
}
