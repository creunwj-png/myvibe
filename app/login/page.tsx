import { LoginScreen } from "./login-screen";

/**
 * S008 로그인·가입 라우트.
 * S007 게스트 공유 시 로그인 요구에서 ?next(로그인 후 돌아갈 곳)와 함께 진입.
 * 리뷰용: ?reason=pileup(시점별 권유 문구), ?variant=banner(인라인 배너), ?error=1(인증 오류).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    reason?: string;
    variant?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/home";
  const reason = sp.reason === "pileup" ? "pileup" : "share";
  const variant = sp.variant === "banner" ? "banner" : "full";

  return (
    <LoginScreen
      next={next}
      reason={reason}
      variant={variant}
      errorMode={sp.error === "1"}
    />
  );
}
