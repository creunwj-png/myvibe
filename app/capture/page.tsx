import { CaptureScreen } from "./capture-screen";

/**
 * S002 캡처 화면 라우트.
 * ?project=결제개편 으로 진입하면 프로젝트 컨텍스트 캡처 상태를 보여준다
 * (S005 "이 프로젝트에 던지기" 진입 시연용).
 */
export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return <CaptureScreen project={project} />;
}
