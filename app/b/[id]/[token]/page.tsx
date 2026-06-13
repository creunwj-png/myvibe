import { InvitedBoardScreen } from "./invited-board-screen";

/**
 * S010 공유 보드(외부 링크 뷰) 라우트.
 * S009 [🔗 공유]가 만든 전용 URL `/b/[id]/[token]`로 팀원이 접속한다.
 * - id: 프로젝트명(보드 단위 식별 — 프로젝트마다 URL이 눈에 띄게 구분되고, 코멘트 저장 키로도 쓰임)
 * - token: 보드 스냅샷(메모+코멘트)을 인코딩한 것(백엔드가 없어 내용을 링크에 담음)
 * 카카오 로그인 후 그 보드만 보인다.
 */
export default async function InvitedBoardPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;
  return <InvitedBoardScreen project={decodeURIComponent(id)} token={token} />;
}
