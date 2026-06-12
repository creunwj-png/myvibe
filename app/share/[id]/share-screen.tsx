"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Home, Loader2 } from "lucide-react";
import { getMemo } from "../../lib/memos";

/**
 * S007 공유.
 * 개인 공간의 메모를 고른 것만 팀 보드로 올린다.
 * 상태: Default(공유 폼) / 올리는 중 / 완료 토스트 / 에러(메모 보존) / 게스트 로그인 분기.
 * - 게스트(기본): [팀 보드에 올리기] → S008 로그인 요구(/login)
 * - ?auth=1(로그인됨): 올리기 → 완료 / ?error=1: 첫 시도 실패 후 다시 시도
 * docs/mockups/screens.md S007 기준.
 */
export function ShareScreen({
  id,
  auth,
  errorMode,
}: {
  id: string;
  auth: boolean;
  errorMode: boolean;
}) {
  const router = useRouter();
  const memo = getMemo(id);
  const board = `${memo.project === "분류 없음" ? "미분류" : memo.project} 팀 보드`;

  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done" | "error">(
    "form"
  );

  function submit() {
    if (!auth) {
      // 게스트 → 공유하려면 로그인 (S008), 로그인 후 돌아와 완료
      router.push(`/login?next=${encodeURIComponent(`/share/${id}?auth=1`)}`);
      return;
    }
    setPhase("loading");
    setTimeout(() => setPhase(errorMode ? "error" : "done"), 700);
  }

  function retry() {
    setPhase("loading");
    setTimeout(() => setPhase("done"), 700);
  }

  // 완료 — 담담하고 따뜻한 확인
  if (phase === "done") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fee500]">
          <Check size={28} className="text-[#1e1e1e]" strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 text-[20px] font-bold leading-[1.4] text-[#1e1e1e]">
          팀 보드에 올렸어요
        </h1>
        <p className="mt-2 text-[15px] leading-[1.5] text-[#666666]">
          팀원이 코멘트로 함께 키워가요.
        </p>
        <Link
          href="/home"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl border border-[#e5e5e5] px-6 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
        >
          홈으로
        </Link>
      </main>
    );
  }

  const loading = phase === "loading";

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-1 pl-1 pr-2">
          <Link
            href={`/memo/${id}`}
            aria-label="취소"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <ArrowLeft size={24} />
          </Link>
          <Link
            href="/home"
            aria-label="홈"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <Home size={22} />
          </Link>
          <h1 className="text-[20px] font-bold text-[#1e1e1e]">팀에 공유</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-2">
          {/* 공유할 메모 (고정) */}
          <p className="text-[13px] text-[#999999]">공유할 메모</p>
          <div className="mt-1.5 rounded-[18px] rounded-tl-[4px] border border-[#e5e5e5] bg-white px-3.5 py-3 text-[15px] leading-[1.5] text-[#333333]">
            {memo.text}
          </div>

          {/* 대상 팀 보드 */}
          <p className="mt-5 text-[13px] text-[#999999]">올릴 곳</p>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-[#f8f8f8] px-3.5 py-3 text-[15px] font-medium text-[#222222]">
            <ArrowRight size={16} className="text-[#808080]" />
            {board}
          </div>

          {/* 한마디 (선택) */}
          <label
            htmlFor="share-note"
            className="mt-5 block text-[13px] text-[#666666]"
          >
            한마디 덧붙이기 (선택)
          </label>
          <input
            id="share-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 다음 회의 때 같이 봐요"
            className="mt-1.5 h-[52px] w-full rounded-xl border border-[#e5e5e5] px-4 text-[16px] text-[#222222] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#333333]"
          />

          {/* 에러 — 메모는 그대로 보존 */}
          {phase === "error" ? (
            <p className="mt-5 text-[14px] leading-[1.5] text-[#808080]">
              잠깐 안 올라갔어요. 다시 해볼까요?
            </p>
          ) : null}
        </div>

        {/* 하단 고정 CTA */}
        <div className="shrink-0 border-t border-[#f0f0f0] p-4">
          <button
            type="button"
            onClick={phase === "error" ? retry : submit}
            disabled={loading}
            className={`flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-[transform,opacity] duration-150 ${
              loading ? "opacity-50" : "active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                올리는 중…
              </>
            ) : phase === "error" ? (
              "다시 시도"
            ) : (
              "팀 보드에 올리기"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
