import { MatchScreen } from "./match-screen";

/**
 * S003 AI 매칭 & 분류 라우트.
 * S002 [던지기]에서 ?text(던진 내용)를 받는다.
 * 리뷰용 상태 진입:
 *   ?fresh=1   → 케이스 B(프로젝트 0개, 즉석 등록)
 *   ?loading=1 → 추천 산출 스켈레톤
 *   ?error=1   → 추천 실패 폴백(케이스 B 형태, 메모 보존)
 */
export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<{
    text?: string;
    fresh?: string;
    loading?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  // 직접 진입(텍스트 없음) 시 리뷰용 더미 메모 사용
  const text = sp.text?.trim() || "로그인 화면 A/B 테스트 해보면 어떨까";

  return (
    <MatchScreen
      text={text}
      fresh={sp.fresh === "1"}
      loading={sp.loading === "1"}
      error={sp.error === "1"}
    />
  );
}
