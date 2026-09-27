import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@demo/lib/utils';

export function Loading({
  loading,
  color,
  children,
}: {
  loading?: boolean;
  color?: string;
  children?: React.ReactNode;
}) {
  if (!loading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={color ? { color } : undefined}
        />
      </div>
    </div>
  );
}
