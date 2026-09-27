import { t } from '@lingui/core/macro';
import React from 'react';
import { ToolbarMenuList } from '../ToolbarMenuList';

export function Heading(props: { onChange: (val: string) => void; value?: string }) {
  const list = [
    { value: 'H1', label: 'H1' },
    { value: 'H2', label: 'H2' },
    { value: 'H3', label: 'H3' },
    { value: 'H4', label: 'H4' },
    { value: 'H5', label: 'H5' },
    { value: 'H6', label: 'H6' },
    { value: 'P', label: t`段落` },
  ];

  return (
    <ToolbarMenuList
      minWidth={120}
      maxWidth={160}
      maxHeight={260}
      value={props.value}
      onSelect={props.onChange}
      options={list}
    />
  );
}
