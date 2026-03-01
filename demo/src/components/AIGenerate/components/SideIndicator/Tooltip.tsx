// src/components/SideIndicator/Tooltip.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChatMessage } from './interface';
import { formatTime, truncateText } from './utils';

interface TooltipProps {
  message: ChatMessage;
  targetRef: React.RefObject<HTMLElement>;
  visible: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  message,
  targetRef,
  visible,
  position = 'left',
  maxWidth = 300,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!targetRef.current || !tooltipRef.current) {
      return;
    }

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 计算各种可能的位置
    const positions = {
      right: {
        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
        left: targetRect.right + 8,
        placement: 'right' as const,
      },
      left: {
        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
        left: targetRect.left - tooltipRect.width - 8,
        placement: 'left' as const,
      },
      top: {
        top: targetRect.top - tooltipRect.height - 8,
        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        placement: 'top' as const,
      },
      bottom: {
        top: targetRect.bottom + 8,
        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        placement: 'bottom' as const,
      },
    };

    // 找出最佳位置（不超出视口）
    let bestPosition = positions[position];
    let bestScore = -Infinity;

    Object.entries(positions).forEach(([key, pos]) => {
      const score = calculatePositionScore(pos, tooltipRect, viewportWidth, viewportHeight);
      if (score > bestScore) {
        bestScore = score;
        bestPosition = { ...pos, placement: key as typeof placement };
      }
    });

    // 确保在视口内
    const adjustedTop = Math.max(10, Math.min(bestPosition.top, viewportHeight - tooltipRect.height - 10));
    const adjustedLeft = Math.max(10, Math.min(bestPosition.left, viewportWidth - tooltipRect.width - 10));

    setTooltipPosition({ top: adjustedTop, left: adjustedLeft });
    setPlacement(bestPosition.placement);
  }, [targetRef, position]);

  const calculatePositionScore = (
    pos: {
      placement: string; top: number; left: number
},
    tooltipRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number
  ) => {
    const { top, left } = pos;
    const right = left + tooltipRect.width;
    const bottom = top + tooltipRect.height;

    let score = 0;

    // 完全在视口内得高分
    if (left >= 0 && right <= viewportWidth && top >= 0 && bottom <= viewportHeight) {
      score += 1000;
    }

    // 与原位置相近得高分
    if (pos.placement === position) {
      score += 500;
    }

    // 距离边界越远得分越高
    const marginLeft = left;
    const marginRight = viewportWidth - right;
    const marginTop = top;
    const marginBottom = viewportHeight - bottom;

    score += Math.min(marginLeft, marginRight, marginTop, marginBottom);

    return score;
  };

  useEffect(() => {
    if (visible) {
      calculatePosition();

      // 监听窗口大小变化和滚动
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);

      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [visible, calculatePosition]);

  if (!visible || !targetRef.current) {
    return null;
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`side-indicator-tooltip tooltip-${placement}`}
      style={{
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 9999,
        maxWidth: `${maxWidth}px`,
      }}
    >
      <div className="tooltip-content">
        {message.content}
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};