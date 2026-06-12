import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * S005 프로젝트 상세 — 최소 placeholder.
 * S004 프로젝트 그룹 탭 흐름이 404로 끊기지 않도록 둔 임시 자리.
 * 본 구현은 이후 mockup-build S005 단계에서 진행한다.
 */
export default async function ProjectPlaceholderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const name = decodeURIComponent(id);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 px-2">
          <Link
            href="/home"
            aria-label="뒤로"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <ArrowLeft size={24} />
          </Link>
          <span className="text-[20px] font-bold text-[#1e1e1e]">{name}</span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
          <p className="text-[13px] font-medium text-[#999999]">S005</p>
          <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
            프로젝트 상세는 곧 준비돼요
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-[#666666]">
            이 프로젝트에 모인 메모를 여기서 한눈에 보게 됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
