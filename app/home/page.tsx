import { HomeScreen } from "./home-screen";

/**
 * S004 홈 라우트.
 * S003 분류 완료 시 ?saved=○○ (또는 __none__)로 확인 토스트를 띄운다.
 * 리뷰용: ?empty=1 로 빈 상태(프로젝트 0개) 확인.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; empty?: string }>;
}) {
  const { saved, empty } = await searchParams;
  return <HomeScreen saved={saved} empty={empty === "1"} />;
}
