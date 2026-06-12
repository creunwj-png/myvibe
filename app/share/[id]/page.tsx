import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * S007 공유 — 최소 placeholder.
 * S006 [팀에 공유하기] 흐름이 404로 끊기지 않도록 둔 임시 자리.
 * 본 구현은 이후 mockup-build S007 단계에서 진행한다.
 */
export default async function SharePlaceholderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 px-2">
          <Link
            href={`/memo/${id}`}
            aria-label="뒤로"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <ArrowLeft size={24} />
          </Link>
          <span className="text-[20px] font-bold text-[#1e1e1e]">팀에 공유</span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
          <p className="text-[13px] font-medium text-[#999999]">S007</p>
          <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
            공유 화면은 곧 준비돼요
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-[#666666]">
            고른 메모만 팀 보드로 올리게 됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
