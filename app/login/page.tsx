import Link from "next/link";
import { X } from "lucide-react";

/**
 * S008 로그인·가입 — 최소 placeholder.
 * S007 게스트 공유 시 로그인 요구 흐름이 404로 끊기지 않도록 둔 임시 자리.
 * ?next 로 로그인 후 돌아갈 곳을 받는다. 본 구현은 이후 mockup-build S008 단계에서 진행한다.
 */
export default async function LoginPlaceholderPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const back = next && next.startsWith("/") ? next : "/home";

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4">
        <header className="flex h-14 shrink-0 items-center -ml-2">
          <Link
            href="/home"
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <X size={24} />
          </Link>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <p className="text-[13px] font-medium text-[#999999]">S008</p>
          <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
            로그인 화면은 곧 준비돼요
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-[#666666]">
            게스트로 적어둔 메모는 로그인하면 그대로 이어집니다.
          </p>
          <Link
            href={back}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#fee500] px-6 text-[15px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
          >
            카카오 계정으로 로그인
          </Link>
          <Link
            href="/home"
            className="mt-4 text-[14px] text-[#999999] transition-colors hover:text-[#333333]"
          >
            나중에
          </Link>
        </div>
      </div>
    </main>
  );
}
