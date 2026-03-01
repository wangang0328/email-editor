import { ChatMessageDisplay } from './types';

export const mockChatMessages: ChatMessageDisplay[] = [
  {
    id: "1",
    role: "user",
    content: "请帮我设计一个简洁的营销邮件模板",
    mjml: null,
    isStreaming: false,
    index: 1
  },
  {
    id: "2",
    role: "assistant",
    content: "我为您设计了一个简洁的营销邮件模板，包含标题、正文和按钮。",
    mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" color="#333" align="center" font-family="Arial">
          限时优惠！
        </mj-text>
        <mj-divider border-width="1px" border-color="#e1e1e1" />
        <mj-text color="#666" line-height="24px">
          感谢您一直以来的支持！我们为您准备了专属优惠，点击下方按钮查看详情。
        </mj-text>
        <mj-button background-color="#007bff" color="white" href="https://example.com/sale">
          立即查看
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    isStreaming: false,
    index: 2
  },
  {
    id: "3",
    role: "user",
    content: "能不能把按钮颜色改成红色，字体再大一点？",
    mjml: null,
    isStreaming: false,
    index: 3
  },
  {
    id: "4",
    role: "assistant",
    content: "已按照您的要求修改了按钮颜色和字体大小，这是更新后的代码：",
    mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" color="#333" align="center" font-family="Arial">
          限时优惠！
        </mj-text>
        <mj-divider border-width="1px" border-color="#e1e1e1" />
        <mj-text color="#666" line-height="24px">
          感谢您一直以来的支持！我们为您准备了专属优惠，点击下方按钮查看详情。
        </mj-text>
        <mj-button background-color="#dc3545" color="white" href="https://example.com/sale" font-size="16px">
          立即查看
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    isStreaming: true,
    index: 4
  },
  {
    id: "5",
    role: "user",
    content: "很好，这就是我想要的！谢谢！",
    mjml: null,
    isStreaming: false,
    index: 5
  }
];

// 或者简写版（不带可选字段的默认值）
export const mockMessagesSimple: any[] = [
  {
    id: "msg-001",
    role: "user",
    content: "创建一个欢迎新用户的邮件模板"
  },
  {
    id: "msg-002",
    role: "assistant",
    content: "为您创建了一个简洁的欢迎邮件模板",
    mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" color="#333">欢迎加入我们！</mj-text>
        <mj-text>感谢您注册我们的服务，我们很高兴有您成为我们的一员。</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  },
  {
    id: "msg-003",
    role: "user",
    content: "能不能加上公司logo和社交媒体链接？"
  },
  {
    id: "msg-004",
    role: "assistant",
    content: "已添加logo和社交媒体链接",
    mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image src="https://example.com/logo.png" width="150px" alt="Company Logo" />
        <mj-text font-size="24px" color="#333">欢迎加入我们！</mj-text>
        <mj-text>感谢您注册我们的服务，我们很高兴有您成为我们的一员。</mj-text>
        <mj-social font-size="15px" icon-size="30px" mode="horizontal">
          <mj-social-network name="facebook" href="https://facebook.com/company" />
          <mj-social-network name="twitter" href="https://twitter.com/company" />
          <mj-social-network name="linkedin" href="https://linkedin.com/company" />
        </mj-social>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    isStreaming: true
  },
  {
    id: "msg-005",
    role: "assistant",
    content: "我还为您优化了移动端的显示效果，这是最终版本：",
    mjml: `<mjml>
  <mj-body>
    <mj-section padding="20px">
      <mj-column>
        <mj-image src="https://example.com/logo.png" width="120px" alt="Company Logo" padding="10px 0" />
        <mj-text font-size="24px" color="#333" padding="10px 0">欢迎加入我们！</mj-text>
        <mj-text color="#666" line-height="22px" padding="10px 0">
          感谢您注册我们的服务，我们很高兴有您成为我们的一员。<br />
          以下是我们的社交媒体，欢迎关注：
        </mj-text>
        <mj-social font-size="13px" icon-size="25px" mode="horizontal" padding="20px 0">
          <mj-social-network name="facebook" href="https://facebook.com/company" />
          <mj-social-network name="twitter" href="https://twitter.com/company" />
          <mj-social-network name="linkedin" href="https://linkedin.com/company" />
        </mj-social>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
  }
];

// 或者更贴近实际聊天的mock数据
const mockChatData: ChatMessageDisplay[] = [
  {
    id: "chat-1",
    role: "user",
    content: "我需要一个产品促销邮件，突出显示折扣信息",
    index: 1
  },
  {
    id: "chat-2",
    role: "assistant",
    content: "我为您设计了一个促销邮件，使用醒目的折扣标签和清晰的CTA按钮：",
    mjml: `<mjml>
  <mj-body background-color="#f5f5f5">
    <mj-section background-color="white" padding="20px" border-radius="10px">
      <mj-column>
        <!-- 折扣标签 -->
        <mj-text align="center" padding="0 0 20px 0">
          <span style="background-color: #ff4757; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
            限时7折
          </span>
        </mj-text>

        <mj-text font-size="28px" font-weight="bold" color="#2d3436" align="center" padding="0 0 15px 0">
          夏季大促销
        </mj-text>

        <mj-text color="#636e72" line-height="24px" padding="0 0 25px 0">
          我们精选的商品正在进行限时折扣，最高可享70% off！活动仅剩最后3天，不要错过！
        </mj-text>

        <mj-button background-color="#00b894" color="white" font-size="18px" border-radius="8px" href="#">
          立即抢购
        </mj-button>

        <mj-text color="#b2bec3" font-size="14px" padding="25px 0 0 0" align="center">
          *活动截止日期：2024年8月31日
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    index: 2
  },
  {
    id: "chat-3",
    role: "user",
    content: "可以，但我想要两个按钮，一个立即购买，一个查看详情",
    index: 3
  },
  {
    id: "chat-4",
    role: "assistant",
    content: "已添加两个按钮，并调整了布局：",
    mjml: `<mjml>
  <mj-body background-color="#f5f5f5">
    <mj-section background-color="white" padding="30px 20px" border-radius="10px">
      <mj-column>
        <!-- 折扣标签 -->
        <mj-text align="center" padding="0 0 20px 0">
          <span style="background-color: #ff4757; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 16px;">
            限时7折优惠
          </span>
        </mj-text>

        <mj-text font-size="28px" font-weight="bold" color="#2d3436" align="center" padding="0 0 15px 0">
          夏季大促销
        </mj-text>

        <mj-text color="#636e72" line-height="24px" padding="0 0 30px 0">
          我们精选的商品正在进行限时折扣，最高可享70% off！活动仅剩最后3天，不要错过！
        </mj-text>

        <!-- 双按钮布局 -->
        <mj-group>
          <mj-column width="50%" padding="0 5px 0 0">
            <mj-button background-color="#00b894" color="white" font-size="16px" border-radius="8px" href="#">
              立即购买
            </mj-button>
          </mj-column>
          <mj-column width="50%" padding="0 0 0 5px">
            <mj-button background-color="#6c5ce7" color="white" font-size="16px" border-radius="8px" href="#">
              查看详情
            </mj-button>
          </mj-column>
        </mj-group>

        <mj-text color="#b2bec3" font-size="14px" padding="30px 0 0 0" align="center">
          *活动截止日期：2024年8月31日
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    isStreaming: true,
    index: 4
  },
  {
    id: "chat-5",
    role: "user",
    content: "完美！这就是我想要的效果，谢谢！",
    index: 5
  }
];