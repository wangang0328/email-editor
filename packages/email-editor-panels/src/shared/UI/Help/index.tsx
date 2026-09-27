import { Tooltip } from '@wa-dev/email-editor-ui';
import React from 'react';
import type { TooltipProps } from '@wa-dev/email-editor-ui';
import { CircleHelp } from 'lucide-react';

export function Help(
  props: TooltipProps &
    Partial<{ style: Partial<React.CSSProperties> }> & {
      title: React.ReactNode;
    }
) {
  return (
    <Tooltip {...{ ...props, style: undefined }} content={props.title}>
      <span style={{ cursor: 'pointer' }}>
        <CircleHelp style={props.style} className="h-4 w-4" />
      </span>
    </Tooltip>
  );
}
