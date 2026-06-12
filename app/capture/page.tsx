import Link from "next/link";

/**
 * S002 캡처 화면 — 최소 placeholder.
 * S001 [바로 시작하기] 흐름이 404로 끊기지 않도록 둔 임시 자리.
 * 본 구현은 이후 mockup-build S002 단계에서 진행한다.
 */
export default function CapturePlaceholderPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-10 text-center">
      <div className="w-full max-w-[480px]">
        <p className="text-[13px] font-medium text-[#999999]">S002</p>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
          캡처 화면은 곧 준비돼요
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-[#666666]">
          여기에 떠오른 걸 툭 던지게 됩니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl border border-[#e5e5e5] px-5 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
        >
          처음으로
        </Link>
      </div>
    </main>
  );
}
