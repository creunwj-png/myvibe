import { ProjectScreen } from "./project-screen";

/**
 * S005 프로젝트 상세 라우트.
 * S004 프로젝트 그룹 탭에서 ?id=프로젝트명(URL 인코딩)으로 진입한다.
 * 알 수 없는 프로젝트명이면 빈 상태(새 프로젝트)로 표시한다.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  return <ProjectScreen name={name} />;
}
