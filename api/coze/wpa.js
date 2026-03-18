// Vercel Serverless Function - 扣子WPA代理
// 部署到Vercel时，此文件将自动成为API路由

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversation_id, corp_uin, robot_history, wpa } = req.body;

    // 验证必要参数
    if (!wpa) {
      return res.status(400).json({ error: 'Missing required parameter: wpa' });
    }

    // 从环境变量获取扣子API配置
    const COZE_API_KEY = process.env.COZE_API_KEY;
    const COZE_BOT_ID = process.env.COZE_BOT_ID;
    const COZE_BASE_URL = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    // 如果没有配置API密钥，返回模拟响应
    if (!COZE_API_KEY) {
      console.log('COZE_API_KEY not configured, returning mock response');
      return res.status(200).json({
        output: generateMockResponse(wpa),
        conversation_id: conversation_id || `mock_${Date.now()}`,
        robot_history: robot_history || []
      });
    }

    // 调用扣子API
    const response = await fetch(`${COZE_BASE_URL}/v1/wpa/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_API_KEY}`
      },
      body: JSON.stringify({
        conversation_id,
        corp_uin: corp_uin || 'default_corp',
        robot_history,
        wpa
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Coze API error:', errorData);
      return res.status(response.status).json({
        error: 'Coze API request failed',
        details: errorData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// 模拟响应生成器
function generateMockResponse(input) {
  const responses = {
    '你好': '您好！我是AI智能客服，很高兴为您服务。请问有什么可以帮助您的？',
    'hello': 'Hello! I\'m your AI customer service assistant. How can I help you today?',
    '产品介绍': '我们的产品包括智能客服系统、数据分析平台和自动化工具。请问您对哪款产品感兴趣？',
    '价格咨询': '我们的定价方案灵活多样，包括基础版、专业版和企业版。具体价格请访问官网或联系销售团队获取详细报价。',
    '技术支持': '我们的技术团队提供7x24小时支持。您可以通过在线客服、邮件或电话联系我们。',
    '常见问题': '以下是一些常见问题：\n1. 如何注册账号？\n2. 如何重置密码？\n3. 如何联系客服？\n\n请告诉我您想了解哪个问题？'
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (input.includes(keyword)) {
      return response;
    }
  }

  return `感谢您的提问："${input}"\n\n我已收到您的消息，正在为您处理。如需更详细的帮助，请联系人工客服。`;
}
