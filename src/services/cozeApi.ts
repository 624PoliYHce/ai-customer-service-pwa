import type { CozeWPAConfig, WPAResponse } from '@/types/chat';

// 扣子API配置
interface CozeConfig {
  apiKey: string;
  botId: string;
  baseUrl?: string;
}

// 默认配置（需要替换为实际值）
const defaultConfig: CozeConfig = {
  apiKey: '', // 从环境变量或配置中获取
  botId: '',
  baseUrl: 'https://api.coze.cn'
};

/**
 * 发送消息到扣子WPA节点
 * 
 * 根据图片中的WPA节点配置：
 * - conversation_id: 会话ID
 * - corp_uin: 企业UIN
 * - robot_history: 机器人历史消息
 * - wpa: 用户输入
 * 
 * 输出: output String
 */
export async function sendToCozeWPA(
  config: CozeWPAConfig,
  _cozeConfig?: Partial<CozeConfig>
): Promise<WPAResponse> {
  
  // 构建请求体
  const requestBody = {
    conversation_id: config.conversationId,
    corp_uin: config.corpUin,
    robot_history: config.robotHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    })),
    wpa: config.wpa
  };

  try {
    // 方式1: 直接调用扣子API（需要后端支持CORS或代理）
    // const response = await fetch(`${mergedConfig.baseUrl}/v1/wpa/execute`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${mergedConfig.apiKey}`
    //   },
    //   body: JSON.stringify(requestBody)
    // });

    // 方式2: 调用本地代理API
    const response = await fetch('/api/coze/wpa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      output: data.output || data.message || '抱歉，我暂时无法回答您的问题。',
      robot_history: data.robot_history
    };
  } catch (error) {
    console.error('扣子WPA调用失败:', error);
    
    // 模拟响应（开发测试用）
    return mockCozeResponse(config.wpa);
  }
}

/**
 * 模拟扣子WPA响应（用于开发和测试）
 */
function mockCozeResponse(input: string): WPAResponse {
  const responses: Record<string, string> = {
    '你好': '您好！我是AI智能客服，很高兴为您服务。请问有什么可以帮助您的？',
    'hello': 'Hello! I\'m your AI customer service assistant. How can I help you today?',
    '产品介绍': '我们的产品包括智能客服系统、数据分析平台和自动化工具。请问您对哪款产品感兴趣？',
    '价格咨询': '我们的定价方案灵活多样，包括基础版、专业版和企业版。具体价格请访问官网或联系销售团队获取详细报价。',
    '技术支持': '我们的技术团队提供7x24小时支持。您可以通过在线客服、邮件或电话联系我们。',
    '常见问题': '以下是一些常见问题：\n1. 如何注册账号？\n2. 如何重置密码？\n3. 如何联系客服？\n\n请告诉我您想了解哪个问题？'
  };

  // 查找匹配的关键词
  for (const [keyword, response] of Object.entries(responses)) {
    if (input.includes(keyword)) {
      return { output: response };
    }
  }

  // 默认响应
  return {
    output: `感谢您的提问："${input}"\n\n我已收到您的消息，正在为您处理。如需更详细的帮助，请联系人工客服。`
  };
}

/**
 * 初始化扣子WPA会话
 */
export function initCozeSession(corpUin?: string): {
  conversationId: string;
  corpUin: string;
} {
  return {
    conversationId: generateConversationId(),
    corpUin: corpUin || 'default_corp'
  };
}

/**
 * 生成会话ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 配置扣子API
 */
export function configureCozeAPI(config: Partial<CozeConfig>): void {
  Object.assign(defaultConfig, config);
}
