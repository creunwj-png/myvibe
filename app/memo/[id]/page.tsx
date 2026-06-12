import { MemoScreen } from "./memo-screen";

/**
 * S006 메모 상세·편집 라우트.
 * S004 검색 결과 / S005 메모 카드에서 ?id=메모ID로 진입한다.
 * 알 수 없는 id면 폴백 더미 메모로 표시한다.
 */
export default async function MemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemoScreen id={id} />;
}
