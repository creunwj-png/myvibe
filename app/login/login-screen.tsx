"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Smartphone, X } from "lucide-react";

type Reason = "share" | "pileup";

const REASONS: Record<Reason, { title: string; sub?: string }> = {
  share: { title: "공유하려면 로그인이 필요해요." },
  pileup: {
    title: "메모가 제법 쌓였어요.",
    sub: "로그인하면 다른 기기에서도 이어볼 수 있어요.",
  },
};

const ASSURANCE =
  "지금까지 게스트로 적어둔 메모는 로그인하면 계정에 그대로 이어집니다.";

/**
 * S008 로그인·가입.
 * 특정 시점(공유·누적·기기변경)에 계정 연결을 부드럽게 권유하되, 거절해도 게스트 흐름을 끊지 않는다.
 * - 공유 시 로그인 요구(전체 화면, 기본) / 시점별 권유(인라인 배너) 두 형태
 * - 카카오 로그인(컴플라이언스 스펙) + 이메일(로그인↔가입) / 인증 오류(데이터 보존)
 * - 성공 → next(직전 흐름 이어서) / 나중에 → 게스트 유지
 * docs/mockups/screens.md S008 기준.
 */
export function LoginScreen({
  next,
  reason: initialReason,
  variant,
  errorMode,
}: {
  next: string;
  reason: Reason;
  variant: "full" | "banner";
  errorMode: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<"full" | "banner">(variant);
  const [reason, setReason] = useState<Reason>(initialReason);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [method, setMethod] = useState<"choice" | "email">("choice");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [retried, setRetried] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (method === "email") emailRef.current?.focus();
  }, [method]);

  function finish() {
    router.push(next || "/home");
  }
  function later() {
    router.push("/home"); // 게스트 유지
  }
  function kakao() {
    setLoading(true);
    setTimeout(finish, 800);
  }
  function emailSubmit() {
    if (!email.trim() || !pw.trim()) return;
    setErrored(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (errorMode && !retried) {
        setErrored(true);
        setRetried(true);
      } else {
        finish();
      }
    }, 800);
  }

  // 시점별 권유 — 인라인 배너 형태
  if (view === "banner") {
    return (
      <main className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4">
          <header className="flex h-14 shrink-0 items-center">
            <span className="text-[22px] font-bold text-[#1e1e1e]">톡캐치</span>
          </header>
          <p className="mb-2 mt-1 text-[12px] text-[#bbbbbb]">
            시점별 권유 (인라인 배너)
          </p>
          {bannerDismissed ? (
            <p className="rounded-xl bg-[#f8f8f8] px-4 py-3 text-[14px] text-[#808080]">
              나중에 — 게스트로 계속하고 있어요.
            </p>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3.5">
              <Smartphone size={20} className="mt-0.5 shrink-0 text-[#808080]" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-[1.5] text-[#222222]">
                  메모가 제법 쌓였어요.
                </p>
                <p className="text-[14px] leading-[1.5] text-[#666666]">
                  로그인하면 다른 기기에서도 이어볼 수 있어요.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReason("pileup");
                      setView("full");
                    }}
                    className="h-9 rounded-lg bg-[#fee500] px-4 text-[14px] font-bold text-[#000000] transition-transform duration-150 active:scale-[0.98]"
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerDismissed(true)}
                    className="h-9 rounded-lg px-3 text-[14px] text-[#999999] transition-colors hover:text-[#333333]"
                  >
                    나중에
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="배너 닫기"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#999999] transition-colors hover:bg-[#f8f8f8]"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 전체 화면 — 공유 시 로그인 요구 / 시점별 권유(눌렀을 때)
  const r = REASONS[reason];
  const canSubmit = email.trim().length > 0 && pw.trim().length > 0;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5">
        <header className="-ml-2 flex h-14 shrink-0 items-center">
          <button
            type="button"
            onClick={later}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center pb-8">
          {/* 왜 지금 로그인인지 */}
          <h1 className="whitespace-pre-line text-[24px] font-bold leading-[1.35] text-[#1e1e1e]">
            {r.title}
          </h1>
          {r.sub ? (
            <p className="mt-1.5 text-[16px] leading-[1.5] text-[#333333]">
              {r.sub}
            </p>
          ) : null}

          {/* 데이터 연결 안심 */}
          <p className="mt-4 text-[15px] leading-[1.6] text-[#666666]">
            {ASSURANCE}
          </p>

          {/* 인증 액션 */}
          <div className="mt-9">
            {method === "choice" ? (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={kakao}
                  disabled={loading}
                  className={`flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#fee500] text-[16px] font-semibold text-[#000000] transition-transform duration-150 ${
                    loading ? "opacity-60" : "active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <MessageCircle size={18} fill="currentColor" />
                  )}
                  카카오 계정으로 로그인
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className="flex h-[52px] items-center justify-center rounded-xl border border-[#e5e5e5] text-[16px] font-semibold text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                >
                  이메일로 계속하기
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("choice");
                    setErrored(false);
                  }}
                  className="-ml-1 mb-3 flex items-center gap-1 self-start text-[14px] text-[#666666]"
                >
                  <ArrowLeft size={16} />
                  다른 방법으로
                </button>

                {errored ? (
                  <p className="mb-3 text-[14px] leading-[1.5] text-[#e02000]">
                    로그인 정보를 다시 확인해주세요.
                  </p>
                ) : null}

                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  aria-label="이메일"
                  className="h-[52px] w-full rounded-xl border border-[#e5e5e5] px-4 text-[16px] text-[#222222] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#333333]"
                />
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") emailSubmit();
                  }}
                  placeholder="비밀번호"
                  aria-label="비밀번호"
                  className="mt-2 h-[52px] w-full rounded-xl border border-[#e5e5e5] px-4 text-[16px] text-[#222222] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#333333]"
                />
                <button
                  type="button"
                  onClick={emailSubmit}
                  disabled={!canSubmit || loading}
                  className={`mt-3 flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-[transform,opacity] duration-150 ${
                    !canSubmit || loading
                      ? "cursor-not-allowed opacity-50"
                      : "active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isSignup ? (
                    "가입하기"
                  ) : (
                    "로그인"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignup((v) => !v)}
                  className="mt-3 self-center text-[14px] text-[#666666] transition-colors hover:text-[#333333]"
                >
                  {isSignup
                    ? "이미 계정이 있어요? 로그인"
                    : "계정이 없어요? 가입하기"}
                </button>
              </div>
            )}
          </div>

          {/* 게스트 유지 */}
          <button
            type="button"
            onClick={later}
            className="mx-auto mt-7 text-[14px] text-[#999999] transition-colors hover:text-[#333333]"
          >
            나중에
          </button>
        </div>
      </div>
    </main>
  );
}
