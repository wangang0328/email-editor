import { CircleHelp } from 'lucide-react';
import { Tooltip, type TooltipProps } from '@demo/components/app-ui';
import React from 'react';

export function Help(props: TooltipProps) {
  return (
    <Tooltip {...props}>
      <CircleHelp className="h-4 w-4 text-muted-foreground" />
    </Tooltip>
  );
}
