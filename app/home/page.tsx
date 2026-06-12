import Link from "next/link";

/**
 * S004 홈 — 최소 placeholder.
 * S002 ✕ 닫기 도착지(홈)가 404로 끊기지 않도록 둔 임시 자리.
 * 본 구현은 이후 mockup-build S004 단계에서 진행한다.
 */
export default function HomePlaceholderPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-10 text-center">
      <div className="w-full max-w-[480px]">
        <p className="text-[13px] font-medium text-[#999999]">S004</p>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
          홈은 곧 준비돼요
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-[#666666]">
          던진 게 어디로 들어갔는지 여기서 확인하게 됩니다.
        </p>
        <Link
          href="/capture"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#fee500] px-6 text-[15px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
        >
          + 아이디어 던지기
        </Link>
      </div>
    </main>
  );
}
