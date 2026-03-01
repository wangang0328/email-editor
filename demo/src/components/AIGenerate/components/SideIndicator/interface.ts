// src/types/index.ts
export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  error?: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
    originalIndex?: number; // 用于导航的原始索引
  };
}

// 原始消息类型（从AIGenerate传入）
export interface RawChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mjml?: string | null;
  isStreaming?: boolean;
  index?: number;
}

export interface IndicatorProps {
  messages: RawChatMessage[]; // 接受原始消息类型
  containerRef?: React.RefObject<HTMLElement>;
  onNavigate?: (index: number) => void;
  className?: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  showTooltips?: boolean;
  showStats?: boolean;
  maxHeight?: string | number;
  virtualizeThreshold?: number;
}

export interface IndicatorItemProps {
  message: ChatMessage;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  onClick: (index: number) => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
  showTooltip?: boolean;
}

export interface ScrollSyncOptions {
  threshold?: number;
  rootMargin?: string;
  activeClass?: string;
}