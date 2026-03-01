/**
 * 发送测试邮件组件
 *
 * 功能：
 *   1. 点击后弹出 Modal，填写收件人邮箱
 *   2. 支持手动输入邮箱（多个，逗号分隔或逐个添加）
 *   3. 支持从当前登录用户信息自动获取邮箱
 *   4. 调用后端 /api/email/send-test 发送
 *   5. SMTP 未配置时自动切换为"HTML 预览"模式
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { Modal, Input, Message, Tag, Tooltip } from '@arco-design/web-react';
import services from '@demo/services';

/* ─── SVG 图标 ─── */

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── 类型 ─── */

interface SendTestEmailProps {
  /** 要发送的 MJML 代码 */
  mjml: string;
  /** 当前登录用户的邮箱（可选，用于自动填充） */
  userEmail?: string;
  /** 自定义触发按钮的类名 */
  className?: string;
  /** 按钮文案 */
  buttonText?: string;
}

/* ─── 邮箱校验 ─── */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/* ─── 组件 ─── */

export const SendTestEmail = memo<SendTestEmailProps>(({
  mjml,
  userEmail,
  className,
  buttonText = '发送测试邮件',
}) => {
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('[测试] AI 生成邮件模板预览');
  const [result, setResult] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // 打开弹窗时初始化
  const handleOpen = useCallback(() => {
    setVisible(true);
    setResult(null);
    setSending(false);
    // 如果有登录用户邮箱且列表为空，自动添加
    if (userEmail && emails.length === 0) {
      setEmails([userEmail]);
    }
  }, [userEmail, emails.length]);

  // 添加邮箱
  const addEmail = useCallback(() => {
    const raw = emailInput.trim();
    if (!raw) return;

    // 支持逗号、分号、空格分隔的多个邮箱
    const newEmails = raw
      .split(/[,;，；\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    const valid: string[] = [];
    const invalid: string[] = [];

    newEmails.forEach(e => {
      if (!isValidEmail(e)) {
        invalid.push(e);
      } else if (emails.includes(e)) {
        // 已存在，跳过
      } else {
        valid.push(e);
      }
    });

    if (invalid.length > 0) {
      Message.warning(`无效邮箱: ${invalid.join(', ')}`);
    }

    if (valid.length > 0) {
      setEmails(prev => [...prev, ...valid]);
    }

    setEmailInput('');
  }, [emailInput, emails]);

  // 删除邮箱
  const removeEmail = useCallback((email: string) => {
    setEmails(prev => prev.filter(e => e !== email));
  }, []);

  // 使用用户邮箱
  const addUserEmail = useCallback(() => {
    if (userEmail && !emails.includes(userEmail)) {
      setEmails(prev => [...prev, userEmail]);
    }
  }, [userEmail, emails]);

  // 按 Enter 添加邮箱
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  }, [addEmail]);

  // 发送
  const handleSend = useCallback(async () => {
    if (emails.length === 0) {
      Message.warning('请至少添加一个收件人邮箱');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await services.email.sendTest({
        to: emails,
        subject,
        mjml,
      });

      if (response.warning) {
        // SMTP 未配置，返回 HTML 预览
        setResult({
          type: 'warning',
          message: response.warning,
        });
      } else if (response.success && response.data) {
        const accepted = response.data.accepted || [];
        const rejected = response.data.rejected || [];

        if (rejected.length > 0) {
          setResult({
            type: 'warning',
            message: `已发送到 ${accepted.join(', ')}。以下地址发送失败: ${rejected.join(', ')}`,
          });
        } else {
          setResult({
            type: 'success',
            message: `测试邮件已成功发送到 ${accepted.join(', ')}`,
          });
          Message.success('测试邮件发送成功！');
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || '发送失败';
      setResult({ type: 'error', message: errorMsg });
      Message.error(errorMsg);
    } finally {
      setSending(false);
    }
  }, [emails, subject, mjml]);

  // 是否可以发送
  const canSend = useMemo(() => emails.length > 0 && !sending, [emails.length, sending]);

  return (
    <>
      {/* 触发按钮 */}
      <button
        className={`code-action-btn ${className || ''}`}
        onClick={handleOpen}
        title="发送测试邮件到邮箱"
      >
        <SendIcon />
        <span>{buttonText}</span>
      </button>

      {/* 发送弹窗 */}
      <Modal
        title={
          <div className="send-test-modal-title">
            <MailIcon />
            <span>发送测试邮件</span>
          </div>
        }
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSend}
        okText={sending ? '发送中...' : '发送'}
        cancelText="取消"
        confirmLoading={sending}
        okButtonProps={{ disabled: !canSend }}
        className="send-test-email-modal"
        style={{ maxWidth: 520 }}
        unmountOnExit
      >
        <div className="send-test-form">
          {/* 收件人 */}
          <div className="send-test-field">
            <label className="send-test-label">收件人</label>
            <div className="email-tags-container">
              {emails.map(em => (
                <Tag
                  key={em}
                  closable
                  onClose={() => removeEmail(em)}
                  className="email-tag"
                  color="arcoblue"
                >
                  {em}
                </Tag>
              ))}
            </div>
            <div className="email-input-row">
              <Input
                value={emailInput}
                onChange={setEmailInput}
                onKeyDown={handleKeyDown}
                placeholder="输入邮箱地址，按 Enter 或点击添加"
                className="email-input"
                allowClear
              />
              <button
                className="email-add-btn"
                onClick={addEmail}
                disabled={!emailInput.trim()}
              >
                添加
              </button>
              {userEmail && !emails.includes(userEmail) && (
                <Tooltip content={`使用登录邮箱: ${userEmail}`}>
                  <button className="email-user-btn" onClick={addUserEmail}>
                    <UserIcon />
                  </button>
                </Tooltip>
              )}
            </div>
            <div className="email-hint">
              支持逗号、分号、空格分隔输入多个邮箱
            </div>
          </div>

          {/* 邮件主题 */}
          <div className="send-test-field">
            <label className="send-test-label">邮件主题</label>
            <Input
              value={subject}
              onChange={setSubject}
              placeholder="输入邮件主题"
            />
          </div>

          {/* 发送结果 */}
          {result && (
            <div className={`send-test-result ${result.type}`}>
              {result.type === 'success' && '✅ '}
              {result.type === 'warning' && '⚠️ '}
              {result.type === 'error' && '❌ '}
              {result.message}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
});

SendTestEmail.displayName = 'SendTestEmail';

