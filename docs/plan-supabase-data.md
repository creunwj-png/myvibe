# 기획: 메모·프로젝트 데이터 Supabase 영구 저장 (시드 제거)

작성일: 2026-06-14

## 1. 문제

프로덕션 URL에서 입력한 메모·프로젝트가 "실 데이터"여야 하는데, 테스트용
목업(시드) 데이터가 계속 나타난다. 삭제해도 다른 기기·시크릿창·캐시 삭제 후
다시 들어가면 시드가 되살아난다.

### 원인

- 메모·프로젝트는 **백엔드가 없고 브라우저 `localStorage`에만** 저장된다
  (`app/lib/store.ts`). Supabase는 현재 "팀 보드 댓글"에만 연동돼 있다.
- `store.ts`에 테스트용 목업 `SEED`(결제개편/온보딩리뉴얼 등)가 코드에 박혀
  있어, 로컬·프로덕션 구분 없이 모든 브라우저 첫 방문 시 자동 주입된다.
- `getServerSnapshot()`이 `SEED`를 반환해 SSR/첫 렌더에서 항상 시드가 그려진다.
- 삭제는 그 브라우저 `localStorage`에만 반영 → "진짜 삭제"가 아니다.

## 2. 목표

- 프로덕션은 **시드 없이 빈 상태로 시작**, 입력한 실 데이터만 보인다.
- 메모·프로젝트를 **Supabase에 영구 저장** → 기기·사람 간 동기화, 진짜 삭제.
- 댓글(이미 Supabase)과 **동일한 익명 공유 모델**을 따른다(실제 인증은 목업이라
  범위 밖 — 로그인 화면은 `setTimeout` 시뮬레이션). 즉 프로덕션 URL은 하나의
  공유 워크스페이스로 동작한다.
- **화면 코드(5개)는 건드리지 않는다.** 스토어의 저장 계층만 교체한다.

## 3. 설계

### 3.1 아키텍처 원칙

화면들은 `useStore()`를 동기적으로 쓰고 selector로 읽는다. 이 동기 API를
유지하고, 그 아래 저장 계층만 바꾼다:

- **하이드레이션**: 마운트 시 Supabase에서 projects·memos를 읽어 state에 채운다
  (env 없으면 localStorage 폴백, 둘 다 없으면 빈 상태). 시드 주입 제거.
- **미러링**: 각 액션은 지금처럼 즉시 local state를 갱신(낙관적)하고, 그 변경을
  Supabase에 비동기로 반영(upsert/delete). 실패는 콘솔에 로깅(조용한 실패 방지).
- **localStorage**: 오프라인 캐시로만 유지(시드 아님).

이렇게 하면 `home/project/memo/match/share` 화면은 수정이 필요 없다.

### 3.2 Supabase 스키마 (사용자가 SQL 에디터에서 실행)

Supabase는 이미 Vercel로 연결돼 있다(env 설정 완료, `board_comments` 사용 중).
아래 SQL을 **Supabase 대시보드 → SQL Editor**에 붙여넣어 한 번 실행한다.
(공개 키로는 RLS 때문에 테이블 생성이 불가 — 생성은 대시보드에서만.)

```sql
-- 프로젝트
create table if not exists public.projects (
  name        text primary key,
  created_at  timestamptz not null default now()
);

-- 메모 (deleted_at: 휴지통용 소프트 삭제)
create table if not exists public.memos (
  id          text primary key,
  text        text not null,
  project     text references public.projects(name) on delete set null,
  shared      boolean not null default false,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz                       -- null = 활성, 값 있으면 휴지통
);

-- 익명 공유 정책(목업 범위 — 실권한은 범위 밖). 댓글 테이블과 동일 컨셉.
alter table public.projects enable row level security;
alter table public.memos    enable row level security;
create policy "anon all projects" on public.projects for all using (true) with check (true);
create policy "anon all memos"    on public.memos    for all using (true) with check (true);
```

> `board_comments`는 이미 존재(현재 코드가 사용 중).

### 3.3 store.ts 변경

- `SEED` 제거(또는 빈 상태로 대체). 초기 state = `{ projects: [], memos: [], comments: [] }`.
- `getServerSnapshot()` → 빈 state 반환.
- `hydrate()`:
  - Supabase 켜짐 → `projects`, `memos` 로드해 `setState`(persist는 캐시 갱신).
  - 꺼짐 → 기존 localStorage 폴백.
- 미러링 헬퍼 추가(fire-and-forget, 에러 로깅):
  - 메모: upsert(throw/edit/reclassify/share/restore), delete
  - 프로젝트: upsert(add/throw 시 ensure), update(rename), delete
- `createdAt`(epoch ms) ↔ `created_at`(timestamptz) 매핑. 표시용 `time` 라벨은
  저장 안 함 — 로드 시 `createdAt`에서 파생.
- 댓글: 메인 보드 댓글은 이미 `board-comments.ts`가 Supabase 처리. store의 시드
  댓글만 제거.

### 3.4 영향 없는 부분

- 화면 컴포넌트 5개: 변경 없음.
- `board-comments.ts`, `board-share.ts`, `supabase.ts`: 변경 없음(스키마만 추가).

### 3.5 휴지통 (소프트 삭제)

메모 삭제는 영구 삭제 대신 소프트 삭제로 바꾼다(프로젝트 삭제는 기존대로 메모를
미분류로 옮기므로 비파괴 — 휴지통 불필요).

- `deleteMemo` → 즉시 row 삭제 대신 `deleted_at = now()` 설정. 모든 일반
  화면/셀렉터에서 `deleted_at != null`은 제외.
- 새 화면 `/trash` (`app/trash/trash-screen.tsx`): 삭제된 메모를 최근 삭제순으로
  나열. 각 항목 **복원**(deleted_at=null) / **영구 삭제**(row hard delete).
- 진입점: 홈 헤더의 비활성 "설정" 자리 옆/대체로 **휴지통(Trash2) 버튼** 추가 →
  `/trash` 이동. (설정은 아직 미구현 placeholder.)
- 자동 비우기(N일 후 purge)는 범위 밖 — 수동 영구 삭제만.

### 3.6 에러 토스트 (저장 실패 노출)

스토어는 React 밖이라, 모듈 레벨 에러 이벤트 + 최상위 구독 컴포넌트로 토스트를
띄운다.

- `store.ts`에 `onError(listener)` / 내부 `emitError(msg)` 추가. Supabase
  미러링 실패 시 `emitError("저장에 실패했어요. 잠시 후 다시 시도해주세요.")`.
- `app/layout.tsx`에 클라이언트 `ErrorToaster` 컴포넌트 마운트 → 구독해 토스트
  표시. 콘솔 로깅은 유지(진단용).

## 4. 결정 사항 요약 (2026-06-14)

1. 기존 시드/테스트 데이터: **전부 제거**(프로덕션 빈 상태 시작).
2. 테이블 생성: 사용자가 대시보드 SQL Editor에서 3.2 실행(Supabase 이미 연결됨).
3. 삭제: **휴지통(소프트 삭제)** + 복원/영구삭제(3.5).
4. 동기화: 진입 시 로드 + 변경 저장까지. 실시간(Realtime)은 범위 밖 — 새로고침.
5. 저장 실패: **에러 토스트**로 노출(3.6).
6. 공유 모델: 프로덕션 URL = 하나의 공유 워크스페이스(인증 목업).

## 5. 배포 체크리스트

1. Supabase 프로젝트에서 3.2 SQL 실행.
2. 호스팅(예: Vercel) 환경변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. env 없으면 자동으로 localStorage 폴백(빈 상태로 시작) — 배포는 안 깨진다.

## 6. 리스크 / 참고

- **공유 워크스페이스**: 인증이 목업이라 프로덕션 URL 방문자는 모두 같은 데이터를
  본다. 1인/소규모 업무용이면 적합. 사용자별 분리가 필요하면 실제 Supabase Auth
  도입이 별도로 필요(범위 밖).
- 기존 localStorage에 쌓인 테스트 데이터는 Supabase로 자동 이관하지 않는다
  (시드라서 버린다). 필요하면 별도 처리.
