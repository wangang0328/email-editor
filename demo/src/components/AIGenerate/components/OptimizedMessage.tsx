import React, { useState, useMemo, memo, useCallback } from 'react';
import { Input, Popover } from '@arco-design/web-react';
import { OptimizedMessageProps } from '../types';
import { extractMJMLFromContent, splitContentAroundMjml, ContentPart } from '../utils/mjmlExtractor';
import ReactMarkdown from 'react-markdown';
import { SendTestEmail } from './SendTestEmail';

/* ─── SVG 图标组件（简洁内联 SVG） ─── */

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ApplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/* ─── 思考中动画 ─── */

const ThinkingDots = memo(() => (
  <div className="thinking-animation">
    <span className="thinking-dot" />
    <span className="thinking-dot" />
    <span className="thinking-dot" />
  </div>
));
ThinkingDots.displayName = 'ThinkingDots';

/* ─── Popover 编辑面板内容 ─── */

interface EditPopoverContentProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditPopoverContent = memo<EditPopoverContentProps>(({ content, onChange, onSave, onCancel }) => (
  <div className="edit-popover-content">
    <div className="edit-popover-header">
      <EditIcon />
      <span>编辑消息</span>
    </div>
    <Input.TextArea
      value={content}
      onChange={onChange}
      autoSize={{ minRows: 2, maxRows: 8 }}
      placeholder="编辑消息内容..."
      autoFocus
      className="edit-popover-textarea"
      onPressEnter={(e) => {
        if (!e.shiftKey) {
          e.preventDefault();
          onSave();
        }
      }}
    />
    <div className="edit-popover-footer">
      <span className="edit-popover-hint">Shift+Enter 换行，Enter 保存</span>
      <div className="edit-popover-actions">
        <button className="edit-action-btn cancel" onClick={onCancel}>取消</button>
        <button className="edit-action-btn save" onClick={onSave}>
          <ApplyIcon /> 保存
        </button>
      </div>
    </div>
  </div>
));
EditPopoverContent.displayName = 'EditPopoverContent';

/* ─── MJML 代码块（浅色背景） ─── */

interface MjmlCodeBlockProps {
  code: string;
  isStreaming?: boolean;
  onApply?: (mjml: string) => void;
  onCopy?: (mjml: string) => void;
}

const MjmlCodeBlock = memo<MjmlCodeBlockProps>(({ code, isStreaming, onApply, onCopy }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
    onCopy?.(code);
  }, [code, onCopy]);

  const handleApply = useCallback(() => {
    const mjml = extractMJMLFromContent(code) || code;
    onApply?.(mjml);
  }, [code, onApply]);

  return (
    <div className="mjml-code-block">
      <div className="mjml-code-header">
        <span>📧 MJML 代码</span>
        <div className="mjml-code-actions">
          <button className="code-action-btn" onClick={handleCopy} title="复制代码">
            <CopyIcon />
          </button>
          <button
            className="code-action-btn primary"
            onClick={handleApply}
            disabled={isStreaming}
            title="应用到编辑器"
          >
            <ApplyIcon />
            <span>应用</span>
          </button>
        </div>
      </div>
      <pre className="mjml-code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
});
MjmlCodeBlock.displayName = 'MjmlCodeBlock';

/* ─── 文本内容渲染（纯 Markdown，不含 MJML） ─── */

/**
 * 预处理 Markdown 内容
 * 1. 规范化换行符：移除多余的空行，保留有意义的段落分隔
 * 2. 修复行内代码的换行问题
 */
const preprocessMarkdown = (content: string): string => {
  if (!content) return '';

  return content
    // 移除行尾的多余空格
    .replace(/[ \t]+$/gm, '')
    // 将连续 3 个及以上的换行符合并为 2 个（保留段落分隔）
    .replace(/\n{3,}/g, '\n\n')
    // 移除开头和结尾的空白
    .trim();
};

/**
 * 自定义代码渲染组件
 * react-markdown v10 中，code 组件通过检查父节点是否为 pre 来判断是否为代码块
 */
const CodeRenderer = ({ node, className, children, ...props }: any) => {
  // 检查是否为代码块：如果 className 包含 language- 前缀，通常是代码块
  // 或者检查内容是否包含换行符
  const content = String(children).replace(/\n$/, '');
  const hasLanguage = className && /language-/.test(className);
  const isMultiLine = content.includes('\n');

  // 代码块：有语言标识或多行内容
  if (hasLanguage || isMultiLine) {
    return (
      <pre className="code-block">
        <code {...props} className={className}>{children}</code>
      </pre>
    );
  }

  // 行内代码：单行无语言标识
  return <code className="inline-code" {...props}>{children}</code>;
};

/**
 * 自定义 pre 渲染组件
 * 避免 ReactMarkdown 默认的 pre 包裹，由 code 组件自行处理
 */
const PreRenderer = ({ children }: any) => {
  // 如果子节点已经是我们自定义渲染的，直接返回
  return <>{children}</>;
};

const TextContent = memo<{ content: string }>(({ content }) => {
  if (!content.trim()) return null;

  const processedContent = preprocessMarkdown(content);

  return (
    <ReactMarkdown
      components={{
        // 段落
        p: ({ children }) => <p className="md-paragraph">{children}</p>,
        // 代码（行内和块级统一处理）
        code: CodeRenderer,
        // pre 标签交给 code 组件处理
        pre: PreRenderer,
        // 列表
        ul: ({ children }) => <ul className="md-list">{children}</ul>,
        ol: ({ children }) => <ol className="md-list">{children}</ol>,
        li: ({ children }) => <li className="md-list-item">{children}</li>,
        // 强调
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        // 链接
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">
            {children}
          </a>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
});
TextContent.displayName = 'TextContent';

/* ─── 主消息组件 ─── */

export const OptimizedMessage = memo<OptimizedMessageProps>(({
  message,
  onCopy,
  onApply,
  onEdit,
  onCopyPrompt,
  onContinueGeneration,
  onApplyPartial,
  isCancelled
}) => {
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  /**
   * 将消息内容拆分为文本 + MJML 片段
   * 解决 ReactMarkdown 在流式 → 完成切换时丢失 MJML 代码块的问题
   */
  const contentParts: ContentPart[] = useMemo(() => {
    if (isUser || !message.content) return [{ type: 'text' as const, content: message.content || '' }];
    return splitContentAroundMjml(message.content);
  }, [message.content, isUser]);

  // 是否包含 MJML 内容（用于显示底部操作栏）
  const hasMjml = useMemo(() => {
    return contentParts.some(p => p.type === 'mjml');
  }, [contentParts]);

  // 提取完整 MJML（用于应用到编辑器）
  const fullMjml = useMemo(() => {
    if (message.mjml) return message.mjml;
    const mjmlPart = contentParts.find(p => p.type === 'mjml');
    if (mjmlPart) return extractMJMLFromContent(mjmlPart.content) || mjmlPart.content;
    return null;
  }, [message.mjml, contentParts]);

  /* ─── 编辑相关 ─── */

  const handleStartEdit = useCallback(() => {
    setEditContent(message.content);
    setIsEditing(true);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    onEdit?.(editContent);
    setIsEditing(false);
  }, [editContent, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditContent(message.content);
    setIsEditing(false);
  }, [message.content]);

  const handleCopyPrompt = useCallback(() => {
    onCopyPrompt?.(message.content);
  }, [message.content, onCopyPrompt]);

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      {/* 头像 */}
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="message-content">
        {/* 消息气泡 */}
        <div className={`message-text${message.isStreaming && message.content ? ' streaming' : ''}`}>
          {message.content ? (
            /* 按拆分后的内容片段渲染，确保 MJML 不会丢失 */
            contentParts.map((part, idx) =>
              part.type === 'mjml' ? (
                <MjmlCodeBlock
                  key={`mjml-${idx}`}
                  code={part.content}
                  isStreaming={message.isStreaming}
                  onApply={onApply}
                  onCopy={onCopy}
                />
              ) : (
                <TextContent key={`text-${idx}`} content={part.content} />
              )
            )
          ) : (
            message.isStreaming && <ThinkingDots />
          )}
        </div>

        {/* 用户消息：hover 时在气泡下方显示编辑/复制按钮，编辑用 Popover 避免抖动 */}
        {isUser && (
          <div className={`hover-actions-bottom${isEditing ? ' force-visible' : ''}`}>
            <Popover
              trigger="click"
              popupVisible={isEditing}
              onVisibleChange={(visible) => {
                if (!visible) handleCancelEdit();
              }}
              position="bl"
              className="edit-popover"
              content={
                <EditPopoverContent
                  content={editContent}
                  onChange={setEditContent}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              }
            >
              <button className="hover-action-btn" onClick={handleStartEdit} title="编辑消息">
                <EditIcon />
              </button>
            </Popover>
            <button className="hover-action-btn" onClick={handleCopyPrompt} title="复制到输入框">
              <CopyIcon />
            </button>
          </div>
        )}

        {/* MJML 操作栏（生成完成且有 MJML 时） */}
        {!message.isStreaming && hasMjml && fullMjml && (
          <div className="mjml-action-bar">
            <span className="mjml-action-label">📧 已生成 MJML 模板</span>
            <div className="mjml-action-buttons">
              <button className="code-action-btn" onClick={() => onCopy?.(fullMjml)} title="复制">
                <CopyIcon /> <span>复制</span>
              </button>
              <button className="code-action-btn primary" onClick={() => onApply?.(fullMjml)} title="应用">
                <ApplyIcon /> <span>应用到编辑器</span>
              </button>
              <SendTestEmail mjml={fullMjml} buttonText="测试发送" />
            </div>
          </div>
        )}

        {/* 局部优化：应用当前块 */}
        {!message.isStreaming && message.blockData && onApplyPartial && (
          <div className="mjml-action-bar">
            <span className="mjml-action-label">✨ 局部优化结果</span>
            <div className="mjml-action-buttons">
              <button
                className="code-action-btn primary"
                onClick={() => onApplyPartial(message.blockData)}
                title="应用到当前选中块"
              >
                <ApplyIcon /> <span>应用局部</span>
              </button>
            </div>
          </div>
        )}

        {/* 继续生成 */}
        {isCancelled && !message.isStreaming && (
          <div className="continue-generation">
            <button className="continue-btn" onClick={() => onContinueGeneration?.(message.id)}>
              <PlayIcon /> 继续生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedMessage.displayName = 'OptimizedMessage';
