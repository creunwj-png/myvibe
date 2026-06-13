# 톡캐치 (TokCatch)

> **떠오르면 툭, 정리는 알아서.**
> 키워드만 던지면 AI가 프로젝트로 정리해 주는, 마찰 0 아이디어 캡처 도구.

회의 중에, 길을 걷다, 자려다 떠오른 한 조각의 생각 — 분류할 새도 없이 사라지기 전에
**1초 만에 던져두면** 톡캐치가 알아서 프로젝트별로 모아 둡니다. 던질 땐 가볍게, 정리는 조용히.

## 🔗 라이브 데모

**https://myvibe-eight.vercel.app**

> 모바일 화면(폭 ~480px) 기준으로 디자인된 목업입니다. 휴대폰 또는 브라우저를 좁게 보면 가장 자연스럽습니다.

## ✨ 핵심 가치 루프

```
던진다  →  AI가 분류한다  →  모아본다  →  골라서 공유한다
(S002)      (S003)           (S004·S005)    (S006·S007)
```

- **마찰 0 캡처** — 열자마자 입력창에 포커스, 프로젝트·태그·날짜를 묻지 않고 바로 던지기
- **반자동 분류** — 자동(오배치)도 수동(귀찮음)도 아닌, 추천을 펼쳐 1탭으로 분류
- **게스트 우선** — 로그인 없이 시작, 공유·동기화가 필요한 순간에만 부드럽게 권유
- **조용한 도구** — 화자로 나서지 않는 톤, 단일 시그널 옐로(`#FEE500`)는 던지기·매칭·완료 순간에만

## 🖥 화면 구성 (9)

| ID | 화면 | 설명 |
|----|------|------|
| S001 | 환영 | 가치 전달 · 게스트 진입 |
| S002 | 캡처 | 자동 포커스 입력 · 던지기 |
| S003 | AI 매칭 & 분류 | 추천 칩 · 즉석 프로젝트 등록 |
| S004 | 홈 | 프로젝트별 모아보기 · 검색 · 확인 토스트 |
| S005 | 프로젝트 상세 | 메모 카드 · 팀 보드 보기 · 이름 변경/삭제 |
| S006 | 메모 상세·편집 | 인라인 편집 · 재분류 · 삭제/되돌리기 |
| S007 | 공유 | 고른 메모만 팀 보드로 |
| S008 | 로그인·가입 | 공유 시점 게스트 로그인 |
| S009 | 팀 보드 | 한 프로젝트의 공유 메모 모아보기 (프로젝트 1:1) |

## 🛠 기술 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **lucide-react** 아이콘 · **Noto Sans KR**
- 상태: 클라이언트 공용 스토어(`useSyncExternalStore` + `localStorage`) — **백엔드 없음**

## 🚀 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

```bash
npm run build   # 프로덕션 빌드
npm run lint    # 린트
```

## ⚠️ 목업 안내

프론트엔드 목업입니다. 실제 서비스가 아니라 다음은 의도적으로 더미/로컬로 처리됩니다.

- **데이터는 브라우저 `localStorage`에 저장** — 기기·브라우저마다 따로 보관되고 서버 동기화는 없습니다.
- **AI 매칭은 더미 추천** — 실제 추론 대신 기존 프로젝트를 후보로 제시합니다.
- **로그인/공유는 UI 흐름만** — 실제 인증·팀 보드 연동은 없습니다.

데이터를 초기화하려면 브라우저 콘솔에서:

```js
localStorage.removeItem('tokcatch.v1'); location.reload()
```

## 📂 기획 문서

설계는 코드보다 먼저 정리했습니다. `docs/` 참고:

- [PRD.md](docs/PRD.md) · [DESIGN.md](docs/DESIGN.md) · [brandvoice.md](docs/brandvoice.md)
- [idea.md](docs/idea.md) · [benchmark.md](docs/benchmark.md) · [userflow.md](docs/userflow.md)
- 화면 설계: [docs/mockups/plan.md](docs/mockups/plan.md) · [docs/mockups/screens.md](docs/mockups/screens.md)
