const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const modeSelect = document.getElementById('mode');
const processBtn = document.getElementById('processBtn');

processBtn.addEventListener('click', async () => {
  const value = inputText.value;
  if (!value.trim()) {
    outputText.textContent = '먼저 문장을 입력해주세요.';
    return;
  }

  const mode = modeSelect.value;
  outputText.textContent = '처리 중...';

  // 시도 1: 서버의 AI 엔드포인트 사용
  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value, mode })
    });

    const data = await resp.json();
    if (resp.ok && data.result) {
      outputText.textContent = data.result;
      return;
    }

    // 서버에 API 키가 없거나 오류가 발생하면 폴백
    if (data && data.error === 'no_api_key') {
      outputText.textContent = 'AI 키 미설정: 로컬 규칙으로 폴백 중...';
    }
  } catch (e) {
    console.warn('AI 서버 호출 실패, 로컬로 폴백합니다.', e);
  }

  // 폴백: 기존 로컬 처리
  const result = processText(value, mode);
  outputText.textContent = result;
});

function processText(text, mode) {
  if (mode === 'survey') {
    return normalizeSurvey(text);
  }
  if (mode === 'email') {
    return normalizeEmail(text);
  }
  if (mode === 'report') {
    return normalizeReport(text);
  }
  return text;
}

function normalizeSurvey(text) {
  const replacements = [
    [/없슴/gi, '없습니다'],
    [/업슴/gi, '없습니다'],
    [/업다/gi, '없습니다'],
    [/없음/gi, '없습니다'],
    [/없다/gi, '없습니다'],
    [/좋았음/gi, '좋았습니다'],
    [/좋음/gi, '좋았습니다'],
    [/좋다/gi, '좋았습니다'],
    [/좋았다/gi, '좋았습니다'],
    [/괜찮다/gi, '괜찮았습니다'],
    [/별로다/gi, '별로였습니다'],
    [/마치는\s*시간(?:이)?/gi, '마치는 시간이'],
    [/늦어요/gi, '늦었습니다'],
    [/끝나요/gi, '끝났습니다'],
    [/ㅠ+|ㅜ+/g, '']
  ];

  return processLines(text, (line) => {
    let normalized = line.replace(/\s+/g, ' ').trim();
    replacements.forEach(([regex, replacement]) => {
      normalized = normalized.replace(regex, replacement);
    });

    if (!normalized) {
      return '';
    }

    normalized = normalized.replace(/[!?]+$/, '').trim();
    if (!/(입니다|했습니다|되었습니다|습니다|요)$/i.test(normalized)) {
      normalized += '입니다';
    }
    return normalized.endsWith('.') ? normalized : normalized + '.';
  });
}

function normalizeEmail(text) {
  const replacements = [
    [/없슴/gi, '없습니다'],
    [/업슴/gi, '없습니다'],
    [/업다/gi, '없습니다'],
    [/없음/gi, '없습니다'],
    [/없다/gi, '없습니다'],
    [/좋았음/gi, '좋았습니다'],
    [/좋음/gi, '좋았습니다'],
    [/좋다/gi, '좋았습니다'],
    [/좋았다/gi, '좋았습니다'],
    [/마치는\s*시간(?:이)?/gi, '마치는 시간이'],
    [/늦어요/gi, '늦었습니다'],
    [/끝나요/gi, '끝났습니다'],
    [/ㅠ+|ㅜ+/g, '']
  ];

  return processLines(text, (line) => {
    let normalized = line.replace(/\s+/g, ' ').trim();
    replacements.forEach(([regex, replacement]) => {
      normalized = normalized.replace(regex, replacement);
    });

    if (!normalized) {
      return '';
    }

    normalized = normalized.replace(/[.!?]+$/, '').trim();
    if (!/(요|니다|습니다|입니다)$/i.test(normalized)) {
      normalized += '입니다';
    }
    return normalized.endsWith('.') ? normalized : normalized + '.';
  });
}

function normalizeReport(text) {
  const replacements = [
    [/없슴/gi, '없습니다'],
    [/업슴/gi, '없습니다'],
    [/업다/gi, '없습니다'],
    [/없음/gi, '없습니다'],
    [/없다/gi, '없습니다'],
    [/있음/gi, '있습니다'],
    [/있다/gi, '있습니다'],
    [/했다/gi, '했습니다'],
    [/했음/gi, '했습니다'],
    [/한다/gi, '했습니다'],
    [/좋았음/gi, '좋았습니다'],
    [/좋음/gi, '좋았습니다'],
    [/좋다/gi, '좋았습니다'],
    [/좋았다/gi, '좋았습니다'],
    [/마치는\s*시간(?:이)?/gi, '마치는 시간이'],
    [/늦어요/gi, '늦었습니다'],
    [/끝나요/gi, '끝났습니다'],
    [/ㅠ+|ㅜ+/g, '']
  ];

  return processLines(text, (line) => {
    let normalized = line.replace(/\s+/g, ' ').trim();
    replacements.forEach(([regex, replacement]) => {
      normalized = normalized.replace(regex, replacement);
    });

    if (!normalized) {
      return '';
    }

    normalized = normalized.replace(/[.!?]+$/, '').trim();
    if (!/(입니다|했습니다|되었습니다|습니다)$/i.test(normalized)) {
      normalized += '입니다';
    }
    return normalized.endsWith('.') ? normalized : normalized + '.';
  });
}

function processLines(text, transform) {
  return text
    .replace(/\r/g, '')
    .split(/\n/)
    .map((line) => {
      if (!line.trim()) {
        return '';
      }
      return transform(line);
    })
    .join('\n');
}
