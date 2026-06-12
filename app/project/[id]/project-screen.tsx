"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MoreVertical, Plus, Search, Share2 } from "lucide-react";
import { ProjectIcon } from "../../lib/project-icon";

type Memo = { id: string; text: string; time: string; shared?: boolean };

// 프로젝트별 더미 메모 (개수는 S004 홈과 일치 — docs/mockups/screens.md)
const PROJECT_MEMOS: Record<string, Memo[]> = {
  결제개편: [
    { id: "p1", text: "결제 버튼 위치 다시 보기", time: "방금" },
    { id: "p2", text: "결제 실패 리트라이 정책 정리", time: "어제" },
    { id: "p3", text: "PG사 수수료 비교", time: "2일 전", shared: true },
    { id: "p4", text: "정기결제 해지 플로우 점검", time: "3일 전" },
    { id: "p5", text: "해외카드 수수료 케이스 모으기", time: "4일 전" },
  ],
  온보딩리뉴얼: [
    { id: "o1", text: "환영 화면 일러스트 시안 보기", time: "방금" },
    { id: "o2", text: "가입 단계 3개로 줄이기", time: "어제", shared: true },
    { id: "o3", text: "온보딩 첫 화면 카피 다시", time: "3일 전" },
  ],
  검색고도화: [
    { id: "s1", text: "검색 결과 정렬 기준 정리", time: "어제" },
    { id: "s2", text: "오타 보정 자동완성 붙이기", time: "2일 전" },
  ],
  로그인개선: [
    { id: "l1", text: "로그인 화면 A/B 테스트 해보면 어떨까", time: "방금" },
  ],
  미분류: [
    { id: "u1", text: "회의록 공유 방식 바꾸기", time: "어제" },
    { id: "u2", text: "데모 영상 길이 검토", time: "2일 전" },
  ],
};

/**
 * S005 프로젝트 상세.
 * 한 프로젝트의 아이디어를 한눈에 모아 회의 전 점검한다.
 * 상태: Default(메모 카드 리스트·공유 배지) / 빈 상태(새 프로젝트) / 검색.
 * docs/mockups/screens.md S005 기준.
 */
export function ProjectScreen({ name }: { name: string }) {
  const memos = PROJECT_MEMOS[name] ?? [];
  const isUnclassified = name === "미분류";

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const q = query.trim();
  const visible = q ? memos.filter((m) => m.text.includes(q)) : memos;

  const captureHref = isUnclassified
    ? "/capture"
    : `/capture?project=${encodeURIComponent(name)}`;
  const ctaLabel = isUnclassified
    ? "아이디어 던지기"
    : "이 프로젝트에 던지기";

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {/* Header */}
        {searchOpen ? (
          <header className="flex h-14 shrink-0 items-center gap-1 px-2">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              aria-label="검색 닫기"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${name}에서 검색`}
                aria-label="프로젝트 내 검색"
                className="h-10 w-full rounded-[20px] bg-[#f0f0f0] pl-10 pr-4 text-[14px] text-[#222222] outline-none placeholder:text-[#999999]"
              />
            </div>
          </header>
        ) : (
          <header className="flex h-14 shrink-0 items-center gap-1 pl-1 pr-2">
            <Link
              href="/home"
              aria-label="뒤로"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <ArrowLeft size={24} />
            </Link>
            <ProjectIcon name={name} size={20} className="ml-1 shrink-0 text-[#808080]" />
            <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold text-[#1e1e1e]">
              {name}
            </h1>
            {memos.length > 0 ? (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="프로젝트 내 검색"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                <Search size={22} />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="프로젝트 메뉴"
              title="이름 변경 등은 곧 추가돼요"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#999999]"
            >
              <MoreVertical size={22} />
            </button>
          </header>
        )}

        {/* 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {memos.length === 0 ? (
            <EmptyBody />
          ) : visible.length === 0 ? (
            <p className="px-4 pt-6 text-[14px] text-[#666666]">
              &apos;{q}&apos;에 맞는 메모가 없어요.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 px-4 pt-2 pb-2">
              {q ? (
                <p className="text-[13px] text-[#999999]">
                  &apos;{q}&apos; 결과 {visible.length}
                </p>
              ) : null}
              {visible.map((m) => (
                <MemoCard key={m.id} memo={m} />
              ))}
            </div>
          )}
        </div>

        {/* 하단 고정 — 이 프로젝트에 던지기 */}
        {!searchOpen ? (
          <div className="shrink-0 border-t border-[#f0f0f0] p-4">
            <Link
              href={captureHref}
              className="flex h-[54px] items-center justify-center gap-1.5 rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
            >
              <Plus size={20} />
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function MemoCard({ memo }: { memo: Memo }) {
  return (
    <Link
      href={`/memo/${memo.id}`}
      className="block rounded-xl border border-[#e5e5e5] bg-white px-4 py-3.5 text-left transition-colors hover:bg-[#f8f8f8] active:bg-[#f0f0f0]"
    >
      <p className="line-clamp-2 text-[16px] leading-[1.5] text-[#333333]">
        {memo.text}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] text-[#999999]">{memo.time}</span>
        {memo.shared ? (
          <span className="flex items-center gap-1 text-[12px] font-medium text-[#2196f3]">
            <Share2 size={13} />
            공유됨
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function EmptyBody() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="text-[18px] font-bold leading-[1.44] text-[#222222]">
        아직 던진 게 없어요.
      </p>
      <p className="mt-2 text-[15px] leading-[1.5] text-[#666666]">
        여기로 떠오르는 걸 던져보세요.
      </p>
    </div>
  );
}
