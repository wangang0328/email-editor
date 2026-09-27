import React from 'react';
import { Stack } from '@wa-dev/email-editor-editor';
import { AdvancedType } from '@wa-dev/email-editor-blocks-react';
import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';

const cellStyle: React.CSSProperties = {
  border: '1px solid #e5e6eb',
  padding: '6px 8px',
  textAlign: 'center',
  fontSize: 12,
  color: '#4e5969',
};

export function TableBlockItem() {
  return (
    <Stack.Item fill>
      <BlockMaskWrapper type={AdvancedType.TABLE} payload={{}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
          }}
        >
          <tbody>
            <tr>
              {['A', 'B', 'C'].map(header => (
                <td key={header} style={{ ...cellStyle, fontWeight: 600 }}>
                  {header}
                </td>
              ))}
            </tr>
            <tr>
              {['1', '2', '3'].map(value => (
                <td key={value} style={cellStyle}>
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </BlockMaskWrapper>
    </Stack.Item>
  );
}
