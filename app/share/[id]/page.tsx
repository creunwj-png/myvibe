import { ShareScreen } from "./share-screen";

/**
 * S007 공유 라우트.
 * S006 [팀에 공유하기]에서 진입. 기본은 게스트(올리기 → S008 로그인).
 * 리뷰용: ?auth=1(로그인됨 → 완료 토스트), ?error=1(첫 시도 실패 폴백).
 */
export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auth?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return (
    <ShareScreen id={id} auth={sp.auth === "1"} errorMode={sp.error === "1"} />
  );
}
