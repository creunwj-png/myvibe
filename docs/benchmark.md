# 벤치마크 리서치 — 톡캐치 (TokCatch)

> Vibe UX · benchmark-research 산출물
> 조사일: 2026-06-12
> 기반: docs/idea.md

## 한 줄 요약
"빠른 캡처"와 "구조화된 정리"는 시장에 따로따로 존재한다 — Mem은 AI에 100% 맡겨 오배치 위험이 있고, Drafts·Keep은 사용자가 100% 직접 분류해 마찰이 남는다. **그 사이, "AI가 후보를 추천하면 사용자가 1초에 고르는" 반자동 분류 자리는 비어 있다.**

## 경쟁·참고 서비스 한눈에 보기

### 직접 경쟁 (Direct)
| # | 서비스 | URL | 한 줄 포지셔닝 | 타깃 | 가격 |
|---|--------|-----|--------------|------|------|
| 1 | Mem | https://get.mem.ai/ | "머릿속 모든 걸 한 곳에" — 던지면 AI가 알아서 정리 | 지식 노동자 | 무료(월 25개) / Pro $12/월 / Teams 별도 |
| 2 | Drafts | https://getdrafts.com/ | "Where Text Starts" — 일단 빠르게 캡처하고 나중에 액션으로 어디든 보냄 | 애플 생태계 사용자 | 무료 / Pro 구독(가격 별도 확인 필요) |
| 3 | Reflect | https://reflect.app/ | "Think better" — 백링크 네트워크 + AI 노트, E2E 암호화 | 지식 노동자·연구자 | $10/월(연 결제) · 14일 체험 |
| 4 | Idea – Notes & Quick Capture | https://apps.apple.com/us/app/idea-notes-quick-capture/id6748178875 | 미니멀 즉시 캡처 + 컬러 커스텀 카테고리(수동 분류) | 개인 메모 사용자 | 무료 + 인앱결제 |

### 간접 경쟁·대체재 / 참고 레퍼런스
| # | 서비스 | URL | 왜 참고하는가 | 겹치는 지점 |
|---|--------|-----|--------------|------------|
| 1 | Apple Notes / Google Keep | (기본 앱) | PM이 지금 불시에 던질 때 실제로 쓰는 곳 | 즉시 캡처는 되지만 구조·AI·프로젝트 매칭 없음 → idea.md의 출발 문제 그 자체 |
| 2 | Notion | https://www.notion.com/ | 프로젝트별 구조화의 기준점 | 구조는 최고지만 모바일 즉시 캡처엔 무겁다(idea.md가 지목한 통증) |
| 3 | Jira Product Discovery / Productboard | https://www.atlassian.com/software/jira/product-discovery | PM이 여러 프로젝트 아이디어를 모아 팀과 공유·코멘트 | 팀 공유·코멘트는 강하나, 자기 전 1초 캡처 도구는 아님(무겁고 데스크톱 중심) |
| 4 | Cleft | https://insight7.io/mind-note-9-apps-for-quick-idea-capture/ | 음성으로 던지면 AI가 "아이디어 vs 할 일"로 의도 분류 | 캡처 후 AI가 분류한다는 발상이 유사(우리는 프로젝트 단위) |

## 핵심 기능 비교
톡캐치 idea.md의 핵심 기능을 기준으로 각 서비스가 그걸 어떻게 다루는지 비교한다.

| 기능/측면 | Mem | Drafts | Reflect | Idea (App Store) |
|----------|-----|--------|---------|------------------|
| 즉시 캡처(모바일, 고민 없이 던지기) | ○ (메시지/음성 캡처) | ◎ (캡처-퍼스트가 핵심 철학) | ○ (iOS 즉시 캡처) | ◎ (미니멀 즉시 캡처) |
| 프로젝트 단위 분류 | △ 자동 컬렉션(폴더리스) | △ 태그/플래그 수동 | △ 백링크 네트워크 | ○ 컬러 카테고리(수동) |
| **AI 프로젝트 매칭 추천 → 사용자 선택(반자동)** | ✕ (100% 자동) | ✕ (100% 수동) | ✕ | ✕ (100% 수동) |
| 프로젝트별 모아보기 | ○ 컬렉션/검색 | ○ 인박스/태그 | ○ 그래프/검색 | ○ 카테고리 필터 |
| 선택 공유 & 팀 코멘트 | △ Teams 플랜(협업 중심 아님) | ✕ (액션으로 외부 전송) | △ 1클릭 퍼블리시(코멘트 아님) | ✕ |
| 개인 공간 기본 + 선택 공유 | △ | ✕ | ○ (private link 공유) | ✕ |
| 플랫폼 | 웹·모바일 | 애플 전용 | iOS·웹 | iOS |

◎ 매우 강함 / ○ 있음 / △ 부분적·우회 / ✕ 없음

## 관찰 — 잘하는 점 / 아쉬운 점
- **Mem**: 던지면 AI가 알아서 묶어주는 "폴더리스" 경험이 매끄럽다(잘함). 하지만 분류를 **전적으로 AI에 위임**해 사용자가 "이게 왜 여기 들어갔지"를 통제하기 어렵다 — idea.md가 경계한 *자동 분류 오배치* 위험. 무료 월 25개 제한이 빡빡하다(아쉬움).
- **Drafts**: "일단 던지고 어디 둘지는 나중에"라는 **캡처-퍼스트 철학**이 톡캐치와 정확히 같은 출발점(잘함). 그러나 분류·전송이 **사용자가 짜는 액션·수동 태그**라 진입장벽이 높고, AI 추천·팀 협업이 없다. 애플 전용이라 반응형 웹 타깃과 어긋남(아쉬움).
- **Reflect**: 네트워크형 사고와 private link 공유, E2E 암호화가 탄탄(잘함). 다만 백링크 중심이라 **"프로젝트 단위로 모아보기"보다 개인 지식관리**에 가깝고, 자기 전 키워드 한 줄 던지기엔 무겁다(아쉬움).
- **Idea (App Store)**: 미니멀 즉시 캡처 + 컬러 카테고리로 가볍다(잘함). 하지만 카테고리 선택이 **완전 수동**이라 "어디에 분류하지?" 마찰이 그대로 남고, 팀 공유가 없다(아쉬움).
- **Notion / Keep(대체재)**: idea.md의 통증을 그대로 증명 — Keep은 가볍지만 구조가 없고, Notion은 구조가 있지만 모바일 즉시 캡처가 무겁다. **둘을 잇는 자리가 비어 있다.**

## 참고 이미지
| 파일 | 무엇인지 | 출처 |
|------|----------|------|
| images/01.png | Drafts 멀티 디바이스 제품샷 — "Capture Everywhere", 캡처-퍼스트 + 액션 전송 | https://getdrafts.com/ |
| images/02.png | Reflect 메인 — Daily notes·백링크·우측 캘린더, "Share with private link"·미팅 연동 | https://reflect.app/ |

> 화면 관찰: Drafts(01)는 어두운 에디터에 군더더기 없는 입력창 — "고민 말고 일단 친다"는 인상이 강하다. Reflect(02)는 좌측 노트·중앙 본문·우측 캘린더의 3분할로 *정리/회고* 쪽에 무게가 실려, 톡캐치가 노리는 "1초 던지기"와는 결이 다르다.

## 우리의 차별 프레이밍 ← 이 리서치의 결론

- **빈틈/기회:** 시장은 *완전 자동 분류*(Mem — 편하지만 오배치·통제 불가)와 *완전 수동 분류*(Drafts·Keep·Idea — 정확하지만 "어디에 넣지?" 마찰) 양 끝으로 갈렸다. **"AI가 후보를 좁혀주고 사람이 1초에 확정하는" 반자동 분류는 아무도 점유하지 않았다.** 또한 빠른 캡처 도구들은 대부분 *개인 도구*라, **PM이 여러 프로젝트를 미리 등록해두고 그 위로 던지는 + 고른 것만 팀과 공유**하는 조합이 비어 있다.
- **우리의 자리(포지셔닝):** *"던질 땐 메모앱처럼 가볍고, 쌓이면 노션처럼 프로젝트별로 정리되는"* — Keep과 Notion 사이를 잇는, **반자동 프로젝트 분류 + 선택적 팀 공유**의 모바일 우선 캡처 도구.
- **차별 포인트:**
  1. **반자동 AI 매칭** — 자동(오배치 위험)도 수동(마찰)도 아닌, *AI 추천 → 1초 선택*의 중간지점. 경쟁 4곳 모두 비워둔 칸.
  2. **PM의 다중 프로젝트 + 선택 공유** — 미리 등록한 프로젝트로 분류하고, "공유" 누른 것만 팀 보드로 올려 코멘트로 키운다(개인 공간 기본 → 설익은 아이디어도 안심하고 던짐).

## 출처
- [Mem – Your AI Thought Partner](https://get.mem.ai/) · [가격](https://get.mem.ai/pricing)
- [Drafts – Where Text Starts](https://getdrafts.com/) · [App Store](https://apps.apple.com/us/app/drafts/id1236254471)
- [Reflect – Think better](https://reflect.app/)
- [Idea – Notes & Quick Capture (App Store)](https://apps.apple.com/us/app/idea-notes-quick-capture/id6748178875)
- [Jira Product Discovery](https://www.atlassian.com/software/jira/product-discovery)
- [Mind Note: 9 Apps for Quick Idea Capture (Cleft 등)](https://insight7.io/mind-note-9-apps-for-quick-idea-capture/)
- [Mem vs Reflect 비교](https://pointofai.com/compare-ai-tools/mem-vs-reflect-notes)
