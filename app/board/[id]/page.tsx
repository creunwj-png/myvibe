import { BoardScreen } from "./board-screen";

/**
 * S009 팀 보드 라우트.
 * S005 [팀 보드 보기] 또는 S007 공유 완료 [보드 보기]에서 ?id=프로젝트명(URL 인코딩)으로 진입.
 * 보드는 별도 엔티티가 아니라 "그 프로젝트의 공유(shared) 메모 집합"으로 파생된다(프로젝트 1:1).
 */
export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  return <BoardScreen name={name} />;
}
