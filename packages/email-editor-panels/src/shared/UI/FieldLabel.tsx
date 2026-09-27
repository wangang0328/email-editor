import React from 'react';
import { Help } from './Help';

export function FieldLabel({
  label,
  tip,
}: {
  label: React.ReactNode;
  tip?: React.ReactNode;
}) {
  if (!tip) {
    return <>{label}</>;
  }

  return (
    <span className='inline-flex items-center gap-1'>
      <span>{label}</span>
      <Help title={tip} position='top' />
    </span>
  );
}
