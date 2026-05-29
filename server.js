require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function makeSystemPrompt(mode) {
  if (mode === 'survey') {
    return `당신은 한국어 설문조사 응답을 정리하는 AI 어시스턴트입니다. 사용자가 여러 줄로 입력한 응답을 받아 문장 단위로 톤을 통일하고 오탈자를 고치며 문장 끝은 정중한 종결 표현(예: '입니다.')으로 맞춰 주세요. 각 입력 줄은 결과에서도 줄바꿈을 유지하세요.`;
  }
  if (mode === 'email') {
    return `당신은 한국어 이메일 문구를 다듬는 AI 어시스턴트입니다. 사용자가 쓴 문구를 공손하고 메일에 바로 쓸 수 있는 문장으로 바꿔주세요. 인사말과 본문, 맺음말을 포함하여 보기 좋게 줄바꿈으로 구분해 출력하세요.`;
  }
  if (mode === 'report') {
    return `당신은 보고서용 문장을 만드는 AI 어시스턴트입니다. 사용자가 입력한 문장을 간결하고 명확한 보고서 문장으로 바꿔주되, 문장 단위로 줄바꿈을 유지하세요.`;
  }
  return `한국어 텍스트를 정리하세요.`;
}

app.post('/api/generate', async (req, res) => {
  const { text = '', mode = 'survey' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  if (!OPENAI_KEY) {
    return res.json({ error: 'no_api_key', message: 'OPENAI_API_KEY not set on server. Set it to enable AI mode.' });
  }

  try {
    const system = makeSystemPrompt(mode);
    const payload = {
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `다음 텍스트를 정리해 주세요:\n\n${text}` }
      ],
      temperature: 0.2
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: 'api_error', detail: err });
    }

    const data = await r.json();
    const assistant = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return res.json({ result: assistant || '' });
  } catch (e) {
    return res.status(500).json({ error: 'server_error', detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
