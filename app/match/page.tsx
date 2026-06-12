import Link from "next/link";

/**
 * S003 AI 매칭 & 분류 — 최소 placeholder.
 * S002 [던지기] 흐름이 404로 끊기지 않도록 둔 임시 자리.
 * 방금 던진 내용을 에코해 "던지기 → 어딘가로 간다" 루프를 체감하게 한다.
 * 본 구현은 이후 mockup-build S003 단계에서 진행한다.
 */
export default async function MatchPlaceholderPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; project?: string }>;
}) {
  const { text, project } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-10 text-center">
      <div className="w-full max-w-[480px]">
        <p className="text-[13px] font-medium text-[#999999]">S003</p>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.36] text-[#1e1e1e]">
          AI 매칭 &amp; 분류는 곧 준비돼요
        </h1>

        {text ? (
          <div className="mx-auto mt-6 max-w-[340px] rounded-[18px] rounded-tl-[4px] border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-left text-[14px] leading-[1.5] text-[#333333]">
            {text}
          </div>
        ) : null}

        <p className="mt-4 text-[15px] leading-[1.5] text-[#666666]">
          {project ? `'${project}'에 던졌어요. ` : ""}
          여기서 프로젝트로 분류하게 됩니다.
        </p>

        <Link
          href="/capture"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl border border-[#e5e5e5] px-5 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
        >
          다시 던지기
        </Link>
      </div>
    </main>
  );
}
