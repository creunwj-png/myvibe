"use client";

import Link from "next/link";
import { ArrowLeft, Home, MessageSquare, Share2 } from "lucide-react";
import { sharedMemosOf, useStore, type Memo } from "../../lib/store";

/**
 * S009 팀 보드.
 * 한 프로젝트에서 "공유"한 메모만 모이는, 팀과 함께 보는 공간(프로젝트 1 : 보드 1).
 * 보드는 파생값 — 그 프로젝트의 shared 메모 집합(최근 공유순).
 * 상태: Default(공유 메모 카드) / 빈 상태(공유 0개).
 * 코멘트 작성은 v1 확장(FR-013)이라 자리만 둔다(비활성 힌트).
 * docs/mockups/screens.md S009 기준.
 */
export function BoardScreen({ name }: { name: string }) {
  const isUnclassified = name === "미분류";
  const s = useStore();
  const memos = sharedMemosOf(s, isUnclassified ? null : name);
  const projectHref = `/project/${encodeURIComponent(name)}`;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-1 pl-1 pr-2">
          <Link
            href={projectHref}
            aria-label="뒤로"
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
          <h1 className="ml-1 min-w-0 flex-1 truncate text-[20px] font-bold text-[#1e1e1e]">
            {name} 팀 보드
          </h1>
        </header>

        {/* 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {memos.length === 0 ? (
            <EmptyBody projectHref={projectHref} />
          ) : (
            <div className="px-4 pt-2 pb-4">
              <p className="flex items-center gap-1.5 px-1 pb-2 text-[13px] text-[#999999]">
                <Share2 size={13} className="text-[#2196f3]" />
                팀과 함께 보는 공유 메모
              </p>
              <div className="flex flex-col gap-2.5">
                {memos.map((m) => (
                  <BoardCard key={m.id} memo={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BoardCard({ memo }: { memo: Memo }) {
  return (
    <Link
      href={`/memo/${memo.id}`}
      className="block rounded-xl border border-[#e5e5e5] bg-white px-4 py-3.5 text-left transition-colors hover:bg-[#f8f8f8] active:bg-[#f0f0f0]"
    >
      <p className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#222222]">
        {memo.text.replace(/\s+/g, " ").trim()}
      </p>
      <p className="mt-2 text-[13px] text-[#2196f3]">내가 올림 · {memo.time}</p>
      {/* 코멘트 자리 — FR-013(v1 확장). 동작은 아직 없음 */}
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-[#f0f0f0] pt-2.5 text-[13px] text-[#bbbbbb]">
        <MessageSquare size={14} />
        코멘트 달기
        <span className="text-[12px]">· 곧 추가돼요</span>
      </div>
    </Link>
  );
}

function EmptyBody({ projectHref }: { projectHref: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="text-[18px] font-bold leading-[1.44] text-[#222222]">
        아직 팀 보드에 올린 게 없어요.
      </p>
      <p className="mt-2 text-[15px] leading-[1.5] text-[#666666]">
        메모에서 &apos;팀에 공유하기&apos;로 골라 올려보세요.
      </p>
      <Link
        href={projectHref}
        className="mt-7 inline-flex h-12 items-center justify-center rounded-xl border border-[#e5e5e5] px-6 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
      >
        프로젝트로 돌아가기
      </Link>
    </div>
  );
}
