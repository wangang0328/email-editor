import axios from 'axios';

// 创建独立的 axios 实例用于 AI 服务
const aiAxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3001' : 'https://www.maocanhua.cn',
  timeout: 60000, // 增加超时时间，流式生成可能较慢
});

// ==================== 类型定义 ====================

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mjml?: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  summary: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface AIGenerateRequest {
  description: string;
  conversationId?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  data?: {
    mjml: string;
    description: string;
    conversationId?: string;
    content?: string;
  };
  error?: string;
}

export interface StreamChunk {
  type:
    | 'chunk'
    | 'done'
    | 'error'
    | 'image_status'
    | 'image_progress'
    | 'image_generated';
  content?: string;
  mjml?: string | null;
  conversationId?: string;
  error?: string;
  /** 服务端标志：MJML 是否结构完整（未被 token limit 截断） */
  isComplete?: boolean;
  /** 图片生成状态 */
  status?: 'analyzing' | 'generating' | 'completed' | 'error';
  message?: string;
  /** 图片生成进度 */
  current?: number;
  total?: number;
  placeholder?: string;
  description?: string;
  /** 单张图片生成结果 */
  success?: boolean;
  /** 局部优化/图片块结果，用于 onApplyPartial */
  blockData?: unknown;
  /** 后处理拦截：回复被判定出格，服务端已替换为模板文案，前端应整条消息替换展示 */
  intercepted?: boolean;
}

export interface ImageGenerationCallback {
  onStatus?: (status: string, message: string, total?: number) => void;
  onProgress?: (
    current: number,
    total: number,
    placeholder: string,
    description: string,
  ) => void;
  onImageGenerated?: (placeholder: string, success: boolean, error?: string) => void;
}

// ==================== 会话管理 API ====================

export const conversations = {
  /**
   * 创建新会话
   */
  async create(userId?: string): Promise<Conversation> {
    const response = await aiAxiosInstance.post<{ success: boolean; data: Conversation }>(
      '/api/conversations',
      { userId },
    );
    return response.data.data;
  },

  /**
   * 获取会话列表
   */
  async list(userId?: string, limit = 20): Promise<Conversation[]> {
    const response = await aiAxiosInstance.get<{
      success: boolean;
      data: Conversation[];
    }>('/api/conversations', { params: { userId, limit } });
    return response.data.data;
  },

  /**
   * 获取会话详情（包含消息历史）
   */
  async get(id: string): Promise<Conversation & { messages: Message[] }> {
    const response = await aiAxiosInstance.get<{
      success: boolean;
      data: Conversation & { messages: Message[] };
    }>(`/api/conversations/${id}`);
    return response.data.data;
  },

  /**
   * 删除会话
   */
  async delete(id: string): Promise<void> {
    await aiAxiosInstance.delete(`/api/conversations/${id}`);
  },
};

// ==================== AI 生成 API ====================

export const ai = {
  /**
   * 非流式生成邮件模板（兼容旧接口）
   */
  async generate(
    description: string,
    conversationId?: string,
  ): Promise<AIGenerateResponse> {
    const response = await aiAxiosInstance.post<AIGenerateResponse>('/api/ai/generate', {
      description,
      conversationId,
    });
    return response.data;
  },

  /**
   * 流式生成邮件模板
   * @param conversationId - 会话 ID
   * @param message - 用户消息
   * @param onChunk - 流式回调
   * @param onDone - 完成回调（isComplete、blockData、intercepted 可选）
   * @param onError - 错误回调
   * @param abortController - 取消控制器
   * @param options - blockContext（局部块上下文）、图片回调等
   */
  async generateStream(
    conversationId: string | null,
    message: string,
    onChunk: (content: string) => void,
    onDone: (
      fullContent: string,
      mjml: string | null,
      conversationId?: string,
      isComplete?: boolean,
      blockData?: unknown,
      intercepted?: boolean,
    ) => void,
    onError: (error: string) => void,
    abortController?: AbortController,
    options?: {
      blockContext?: { focusIdx: string; blockData: unknown; blockType?: string };
      onStatus?: ImageGenerationCallback['onStatus'];
      onProgress?: ImageGenerationCallback['onProgress'];
      onImageGenerated?: ImageGenerationCallback['onImageGenerated'];
    },
  ): Promise<void> {
    const baseURL = import.meta.env.DEV
      ? 'http://localhost:3001'
      : 'https://www.maocanhua.cn';
    const { blockContext, onStatus, onProgress, onImageGenerated } = options || {};

    try {
      const response = await fetch(`${baseURL}/api/ai/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message,
          generateImages: false,
          ...(blockContext && { blockContext }),
        }),
        signal: abortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let mjml: string | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.slice(6));

              if (data.type === 'chunk' && data.content) {
                fullContent += data.content;
                onChunk(data.content);
              } else if (data.type === 'done') {
                fullContent = data.content ?? fullContent;
                mjml = data.mjml ?? null;
                onDone(
                  fullContent,
                  mjml,
                  data.conversationId,
                  data.isComplete,
                  data.blockData,
                  data.intercepted,
                );
              } else if (data.type === 'error') {
                onError(data.error || '生成失败');
              } else if (data.type === 'image_status') {
                onStatus?.(data.status || '', data.message || '', data.total);
              } else if (data.type === 'image_progress') {
                onProgress?.(
                  data.current || 0,
                  data.total || 0,
                  data.placeholder || '',
                  data.description || '',
                );
              } else if (data.type === 'image_generated') {
                onImageGenerated?.(
                  data.placeholder || '',
                  data.success || false,
                  data.error,
                );
              }
            } catch (e) {
              // 忽略解析错误
              console.warn('解析 SSE 数据失败:', line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('流式生成失败:', error);

      // 检查是否是用户取消的操作
      if (error.name === 'AbortError') {
        console.log('用户取消了生成操作');
        return; // 不调用 onError，因为这是用户主动取消
      }

      onError(error.message || '网络错误，请检查服务器连接');
    }
  },

  /**
   * 解析用户意图为块操作指令（如移动块）
   * @returns { instructions: Array<{ type: 'move_block', fromIdx?, toIdx? }> }
   */
  async getBlockInstructions(params: {
    message: string;
    contentJSON: unknown;
  }): Promise<{
    instructions: Array<{ type: string; fromIdx?: string; toIdx?: string }>;
  }> {
    const response = await aiAxiosInstance.post<{
      success: boolean;
      data?: { instructions: Array<{ type: string; fromIdx?: string; toIdx?: string }> };
      error?: string;
    }>('/api/ai/block-instructions', {
      message: params.message,
      contentJSON: params.contentJSON,
    });
    if (!response.data.success || !response.data.data) {
      return { instructions: [] };
    }
    return { instructions: response.data.data.instructions || [] };
  },
};

// ==================== 测试邮件 API ====================

export interface SendTestEmailRequest {
  to: string[];
  subject?: string;
  mjml: string;
}

export interface SendTestEmailResponse {
  success: boolean;
  data?: {
    messageId: string;
    accepted: string[];
    rejected: string[];
  };
  html?: string;
  warning?: string;
  error?: string;
}

export const email = {
  /**
   * 发送测试邮件
   * SMTP 已配置时实际发送；未配置时返回 HTML 预览
   */
  async sendTest(params: SendTestEmailRequest): Promise<SendTestEmailResponse> {
    const response = await aiAxiosInstance.post<SendTestEmailResponse>(
      '/api/email/send-test',
      params,
    );
    return response.data;
  },

  /**
   * MJML → HTML 预览（不发送）
   */
  async preview(
    mjml: string,
  ): Promise<{ success: boolean; data?: { html: string }; error?: string }> {
    const response = await aiAxiosInstance.post('/api/email/preview', { mjml });
    return response.data;
  },
};

// 导出默认对象（兼容旧代码）
export default {
  ai,
  conversations,
  email,
};
