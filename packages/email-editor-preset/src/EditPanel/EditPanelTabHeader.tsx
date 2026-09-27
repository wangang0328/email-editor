import { cn } from '@wa-dev/email-editor-ui';
import { ChevronLeft } from 'lucide-react';
import React from 'react';

import {
  editPanelTabBackButtonClass,
  editPanelTabBarFlexClass,
  editPanelTabsHeaderRowClass,
  editPanelTabsHeaderWrapClass,
} from './editPanelTabs';

export function EditPanelTabHeader({
  defaultTabBar,
  onBack,
}: {
  defaultTabBar: React.ReactNode | null;
  onBack?: () => void;
}) {
  return (
    <div className={editPanelTabsHeaderRowClass}>
      {onBack ? (
        <button
          type="button"
          className={editPanelTabBackButtonClass}
          onClick={onBack}
          aria-label="back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
      {defaultTabBar ? (
        <div className={cn(editPanelTabsHeaderWrapClass, editPanelTabBarFlexClass)}>
          {defaultTabBar}
        </div>
      ) : null}
    </div>
  );
}
