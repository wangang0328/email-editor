import React from 'react';
import { Button } from '@demo/components/app-ui';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@demo/components/demo-ui';

interface ScrollToBottomButtonProps {
  visible: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  unreadCount = 0,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <div className="scroll-to-bottom-btn">
      <Badge count={unreadCount}>
        <Button
          type="primary"
          shape="circle"
          icon={<ChevronDown size={16} />}
          onClick={onClick}
        />
      </Badge>
    </div>
  );
};
