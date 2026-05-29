# 문장 정리 웹앱

간단한 웹 앱으로 입력한 문장을 세 가지 방식으로 정리할 수 있습니다.

## 기능

- **설문조사 정리**: 문장 톤 통일 및 오타 보정
- **메일 문장**: 메일에 쓰기 좋은 공손한 표현으로 다듬기
- **보고서 문장**: 간단하고 명확한 보고서 문장으로 정리

## 실행 방법

There are two modes to run the app:

1) Static mode (no AI): open `index.html` in your browser. The app will use local rules to normalize text.

2) AI mode (recommended): run the included server which forwards requests to OpenAI.

	- Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
	- Install dependencies and start the server:

```bash
npm install
npm start
```

	- Open http://localhost:3000 in your browser. The client will call `/api/generate` to get AI-enhanced results. If the server has no API key, the client falls back to local rules.

## 파일 구조

- `index.html` - 페이지 구조
- `styles.css` - 스타일
- `script.js` - 문장 정리 로직
