"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { ProjectIcon } from "../../lib/project-icon";
import {
  deleteMemo,
  deleteProject,
  memosOf,
  renameProject,
  useStore,
  type Memo,
} from "../../lib/store";

/**
 * S005 프로젝트 상세.
 * 한 프로젝트의 아이디어를 한눈에 모아 회의 전 점검한다.
 * 상태: Default(메모 카드 리스트·공유 배지) / 빈 상태(새 프로젝트) / 검색.
 * docs/mockups/screens.md S005 기준.
 */
export function ProjectScreen({ name }: { name: string }) {
  const isUnclassified = name === "미분류";
  const s = useStore();
  const memos = memosOf(s, isUnclassified ? null : name);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const router = useRouter();
  const isRealProject =
    !isUnclassified && s.projects.some((p) => p.name === name);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [renaming]);

  function submitRename() {
    const nn = renameValue.trim();
    setRenaming(false);
    if (nn && nn !== name) {
      renameProject(name, nn);
      router.replace(`/project/${encodeURIComponent(nn)}`);
    }
  }

  function deleteNow() {
    deleteProject(name);
    router.push("/home");
  }

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

            {renaming ? (
              <>
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename();
                    if (e.key === "Escape") setRenaming(false);
                  }}
                  aria-label="프로젝트 이름"
                  className="ml-1 h-10 min-w-0 flex-1 rounded-lg border border-[#e5e5e5] px-3 text-[18px] font-bold text-[#1e1e1e] outline-none focus:border-[#333333]"
                />
                <button
                  type="button"
                  onClick={submitRename}
                  className="flex h-9 items-center rounded-lg px-3 text-[15px] font-bold text-[#1e1e1e]"
                >
                  완료
                </button>
              </>
            ) : (
              <>
                <span className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1e1e1e] bg-white text-[#1e1e1e]">
                  <ProjectIcon name={name} size={20} />
                </span>
                <h1 className="ml-2 min-w-0 flex-1 truncate text-[20px] font-bold text-[#1e1e1e]">
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
                {isRealProject ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="프로젝트 메뉴"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                    >
                      <MoreVertical size={22} />
                    </button>
                    {menuOpen ? (
                      <div className="absolute right-1 top-11 z-50 w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-[0px_2px_6px_rgba(0,0,0,0.08)]">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setRenameValue(name);
                            setRenaming(true);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                        >
                          <Pencil size={16} />
                          이름 변경
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setConfirmDelete(true);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] text-[#e02000] transition-colors hover:bg-[#f8f8f8]"
                        >
                          <Trash2 size={16} />
                          프로젝트 삭제
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
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

      {/* 메뉴 바깥 클릭 닫기 */}
      {menuOpen ? (
        <button
          type="button"
          aria-label="닫기"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      ) : null}

      {/* 프로젝트 삭제 확인 */}
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <button
            type="button"
            aria-label="취소"
            tabIndex={-1}
            onClick={() => setConfirmDelete(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div className="relative w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
            <p className="text-center text-[16px] font-medium text-[#222222]">
              이 프로젝트를 삭제할까요?
            </p>
            <p className="mt-1.5 text-center text-[13px] leading-[1.5] text-[#666666]">
              메모는 지워지지 않고 미분류로 옮겨져요.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-12 flex-1 rounded-xl border border-[#e5e5e5] text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={deleteNow}
                className="h-12 flex-1 rounded-xl bg-[#e02000] text-[15px] font-bold text-white transition-transform duration-150 active:scale-[0.99]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function MemoCard({ memo }: { memo: Memo }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="relative">
      <Link
        href={`/memo/${memo.id}`}
        className="block rounded-xl border border-[#ffb74d] bg-[#fff4e6] py-3.5 pl-4 pr-12 text-left transition-colors hover:bg-[#ffedd6] active:bg-[#ffe3bf]"
      >
        <p className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#5d4037]">
          {memo.text.replace(/\s+/g, " ").trim()}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[13px] text-[#b07a4e]">{memo.time}</span>
          {memo.shared ? (
            <span className="flex items-center gap-1 text-[12px] font-bold text-[#d97706]">
              <Share2 size={13} />
              공유됨
            </span>
          ) : null}
        </div>
      </Link>

      {/* 목록에서 바로 삭제 */}
      <button
        type="button"
        onClick={() => setConfirm(true)}
        aria-label="메모 삭제"
        className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-[#c08a5a] transition-colors hover:bg-[#ffe3bf] hover:text-[#8a5a30]"
      >
        <X size={18} />
      </button>

      {confirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <button
            type="button"
            aria-label="취소"
            tabIndex={-1}
            onClick={() => setConfirm(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div className="relative w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
            <p className="text-center text-[16px] font-medium text-[#222222]">
              이 메모를 삭제할까요?
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="h-12 flex-1 rounded-xl border border-[#e5e5e5] text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  deleteMemo(memo.id);
                }}
                className="h-12 flex-1 rounded-xl bg-[#e02000] text-[15px] font-bold text-white transition-transform duration-150 active:scale-[0.99]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
