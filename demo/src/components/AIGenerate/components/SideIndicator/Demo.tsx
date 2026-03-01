// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SideIndicator } from './index';
import { ChatMessage } from './interface';
import './demo.css';

const Demo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 生成示例消息
  useEffect(() => {
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        content: '你好，我是DeepSeek AI助手！有什么可以帮助你的吗？',
        type: 'assistant',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        content: '我想了解如何优化React应用的性能',
        type: 'user',
        timestamp: new Date(Date.now() - 3500000),
      },
      {
        id: '3',
        content: 'React应用性能优化可以从以下几个方面入手：\n1. 使用React.memo避免不必要的重渲染\n2. 使用useMemo和useCallback缓存计算结果和函数\n3. 使用虚拟滚动处理长列表\n4. 使用React.lazy进行代码分割\n5. 使用Suspense实现懒加载',
        type: 'assistant',
        timestamp: new Date(Date.now() - 3400000),
        metadata: {
          tokens: 120,
          model: 'deepseek-chat',
          processingTime: 1200,
        },
      },
      {
        id: '4',
        content: '能详细讲讲虚拟滚动吗？',
        type: 'user',
        timestamp: new Date(Date.now() - 3300000),
      },
      {
        id: '5',
        content: '虚拟滚动是一种优化长列表渲染的技术。它只渲染用户当前可见区域的内容，而不是整个列表。这可以大幅减少DOM元素数量，提高页面性能。\n\n常用的虚拟滚动库有react-window和react-virtualized。',
        type: 'assistant',
        timestamp: new Date(Date.now() - 3200000),
        metadata: {
          tokens: 150,
          model: 'deepseek-chat',
          processingTime: 1500,
        },
      },
      {
        id: '6',
        content: '还有更多建议吗？',
        type: 'user',
        timestamp: new Date(Date.now() - 3100000),
      },
      {
        id: '7',
        content: '当然！其他优化建议包括：\n- 使用Web Workers处理复杂计算\n- 优化图片和资源加载\n- 使用Service Worker缓存资源\n- 监控Core Web Vitals指标\n- 使用React DevTools分析性能瓶颈',
        type: 'assistant',
        timestamp: new Date(Date.now() - 3000000),
        metadata: {
          tokens: 180,
          model: 'deepseek-chat',
          processingTime: 1800,
        },
      },
    ];

    setMessages(sampleMessages);

    // 模拟流式消息
    const interval = setInterval(() => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.isStreaming) {
          // 更新流式消息
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + ' 这里是流式更新的内容...',
            },
          ];
        }

        // 添加新的流式消息
        return [
          ...prev,
          {
            id: `stream-${Date.now()}`,
            content: 'AI正在思考中',
            type: 'assistant' as const,
            timestamp: new Date(),
            isStreaming: true,
          },
        ];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (index: number) => {
    console.log('导航到消息:', index);
    if (chatContainerRef.current) {
      const messages = chatContainerRef.current.querySelectorAll('.message-item');
      if (messages[index]) {
        messages[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  };

  const handleAddMessage = () => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: '这是一条新的用户消息',
      type: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAddError = () => {
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      content: '网络请求失败，请重试',
      type: 'assistant',
      timestamp: new Date(),
      error: '连接超时',
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>DeepSeek AI 对话界面</h1>
        <div className="app-controls">
          <button onClick={handleAddMessage}>添加消息</button>
          <button onClick={handleAddError}>添加错误</button>
        </div>
      </header>

      <div className="app-content">
        <div ref={chatContainerRef} className="chat-container">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-item message-${msg.type} ${
                msg.error ? 'message-error' : ''
              }`}
              data-index={index}
            >
              <div className="message-header">
                <span className="message-type">
                  {msg.type === 'user' ? '用户' : 'AI助手'}
                </span>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">
                {msg.content}
              </div>
              {msg.error && (
                <div className="message-error-info">
                  ⚠️ {msg.error}
                </div>
              )}
              {msg.isStreaming && (
                <div className="message-streaming">
                  正在输入...
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右侧指示器 */}
        <SideIndicator
          messages={messages}
          onNavigate={handleNavigate}
          defaultExpanded={true}
          showTooltips={true}
          showStats={true}
          maxHeight="70vh"
          virtualizeThreshold={10}
        />
      </div>
    </div>
  );
};

export default Demo;
