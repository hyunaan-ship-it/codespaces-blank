const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const modeSelect = document.getElementById('mode');
const processBtn = document.getElementById('processBtn');

processBtn.addEventListener('click', () => {
  const value = inputText.value.trim();
  if (!value) {
    outputText.textContent = '먼저 문장을 입력해주세요.';
    return;
  }

  const mode = modeSelect.value;
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
  const typoMap = {
    '\b없슴\b': '없습니다',
    '\b업슴\b': '없습니다',
    '\b업다\b': '없습니다',
    '\b없음\b': '없습니다',
    '\b없다\b': '없습니다',
    '\b좋음\b': '좋았습니다',
    '\b좋았다\b': '좋았습니다',
    '\b좋다\b': '좋았습니다',
    '\b괜찮다\b': '괜찮았습니다',
    '\b별로다\b': '별로였습니다'
  };

  let normalized = text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  Object.keys(typoMap).forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi');
    normalized = normalized.replace(regex, typoMap[pattern]);
  });

  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => {
      sentence = sentence.replace(/\.$/, '');
      sentence = sentence.replace(/\?$/, '').replace(/!$/, '');
      sentence = sentence.replace(/\s+/g, ' ');
      return sentence + '입니다.';
    });

  return sentences.join(' ');
}

function normalizeEmail(text) {
  const cleanText = text.replace(/\r/g, '').trim();
  const sentences = cleanText
    .split(/\n+|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => {
      let trimmed = sentence.replace(/[.!?]+$/, '').trim();
      if (trimmed.length === 0) {
        return '';
      }
      if (/요$/.test(trimmed) || /니다$/.test(trimmed) || /습니다$/.test(trimmed)) {
        return trimmed + '.';
      }
      return trimmed + '입니다.';
    })
    .filter(Boolean);

  if (sentences.length === 0) {
    return '유효한 문장이 없습니다. 문장을 다시 입력해주세요.';
  }

  const greeting = '안녕하세요.';
  const body = sentences.join(' ');
  const closing = '감사합니다.';

  return [greeting, body, closing].join('\n\n');
}

function normalizeReport(text) {
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => {
      let result = sentence
        .replace(/\b없슴\b|\b업슴\b|\b업다\b|\b없음\b|\b없다\b/gi, '없습니다')
        .replace(/\b있음\b|\b있다\b/gi, '있습니다')
        .replace(/\b했다\b|\b했음\b|\b한다\b/gi, '했습니다')
        .replace(/\s+/g, ' ')
        .replace(/[.!?]+$/, '')
        .trim();

      if (!/[.]$/.test(result)) {
        result += '입니다.';
      }
      return result;
    });

  return sentences.join(' ');
}
