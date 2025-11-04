// api/fortune.js
export default async function handler(req, res) {
  // 设置CORS头部，允许您的GitHub Pages网站访问
  res.setHeader('Access-Control-Allow-Origin', 'https://zhuiming000.github.io'); // 请替换为您的GitHub Pages地址
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userMessage } = await req.body;

    // 调用DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // 从环境变量安全读取密钥
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `请你扮演一位有趣又神秘的AI算命师。请根据用户的问题，用轻松幽默又带点神秘感的口吻生成一段运势解读或趣味分析。用户的问题是：${userMessage}`
          }
        ],
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const data = await deepseekResponse.json();
    const aiReply = data.choices[0]?.message?.content || '大师似乎打了个盹儿，请再试一次。';

    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '内部服务器错误' });
  }
}