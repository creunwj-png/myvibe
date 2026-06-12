// 목업 더미 메모 — S004 검색 / S005 카드 / S006 상세 / S007 공유가 공유한다.
// docs/mockups/screens.md Global Mockup Assumptions 기준.

export type Memo = {
  text: string;
  project: string;
  time: string;
  shared?: boolean;
};

export const MEMOS: Record<string, Memo> = {
  p1: { text: "결제 버튼 위치 다시 보기", project: "결제개편", time: "방금" },
  p2: { text: "결제 실패 리트라이 정책 정리", project: "결제개편", time: "어제" },
  p3: { text: "PG사 수수료 비교", project: "결제개편", time: "2일 전", shared: true },
  p4: { text: "정기결제 해지 플로우 점검", project: "결제개편", time: "3일 전" },
  p5: { text: "해외카드 수수료 케이스 모으기", project: "결제개편", time: "4일 전" },
  o1: { text: "환영 화면 일러스트 시안 보기", project: "온보딩리뉴얼", time: "방금" },
  o2: { text: "가입 단계 3개로 줄이기", project: "온보딩리뉴얼", time: "어제", shared: true },
  o3: { text: "온보딩 첫 화면 카피 다시", project: "온보딩리뉴얼", time: "3일 전" },
  s1: { text: "검색 결과 정렬 기준 정리", project: "검색고도화", time: "어제" },
  s2: { text: "오타 보정 자동완성 붙이기", project: "검색고도화", time: "2일 전" },
  l1: { text: "로그인 화면 A/B 테스트 해보면 어떨까", project: "로그인개선", time: "방금" },
  u1: { text: "회의록 공유 방식 바꾸기", project: "미분류", time: "어제" },
  u2: { text: "데모 영상 길이 검토", project: "미분류", time: "2일 전" },
  m1: { text: "로그인 화면 A/B 테스트 해보면 어떨까", project: "로그인개선", time: "방금" },
  m2: { text: "PG사 수수료 비교", project: "결제개편", time: "2일 전", shared: true },
  m3: { text: "결제 실패 리트라이 정책 정리", project: "결제개편", time: "어제" },
  m4: { text: "온보딩 첫 화면 카피 다시 보기", project: "온보딩리뉴얼", time: "3일 전" },
  m5: { text: "검색 결과 정렬 기준 정리", project: "검색고도화", time: "어제" },
};

export const FALLBACK_MEMO: Memo = {
  text: "로그인 화면 A/B 테스트 해보면 어떨까",
  project: "결제개편",
  time: "방금",
};

export function getMemo(id: string): Memo {
  return MEMOS[id] ?? FALLBACK_MEMO;
}
