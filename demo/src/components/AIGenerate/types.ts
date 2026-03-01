export interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mjml?: string | null;
  isStreaming?: boolean;
  index?: number;
  /** 局部优化时服务端返回的块数据，用于「应用局部」 */
  blockData?: unknown;
}

export interface OptimizedMessageProps {
  message: ChatMessageDisplay;
  onCopy: (mjml: string) => void;
  onApply: (mjml: string) => void;
  onEdit?: (content: string) => void;
  onCopyPrompt?: (content: string) => void;
  onContinueGeneration?: (messageId: string) => void;
  onApplyPartial?: (blockData: unknown) => void;
  isCancelled?: boolean;
}
