import { HomeScreen } from "./home-screen";

/**
 * S004 홈 라우트.
 * S003 분류 완료 시 ?saved=○○ (또는 __none__)로 확인 토스트를 띄운다.
 * 프로젝트/메모 데이터는 공용 스토어(app/lib/store)에서 읽는다.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  return <HomeScreen saved={saved} />;
}
