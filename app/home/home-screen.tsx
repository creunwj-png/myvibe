"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FolderPlus,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ProjectIcon } from "../lib/project-icon";
import {
  addProject,
  countOf,
  projectsByRecency,
  searchMemos,
  useStore,
  type Memo,
} from "../lib/store";

function deriveToast(saved?: string) {
  if (!saved) return null;
  if (saved === "__none__") return "분류 없이 저장했어요";
  return `'${saved}'에 담았어요`;
}

/**
 * S004 홈.
 * 던진 게 어디 들어갔는지 확인(aha 마무리)하고, 프로젝트별 점검·반복 캡처의 허브.
 * 상태: 채워짐(기본) / 빈 상태 / 던진 직후 확인 토스트 / 검색.
 * docs/mockups/screens.md S004 기준. 데이터는 공용 스토어(app/lib/store).
 */
export function HomeScreen({ saved }: { saved?: string }) {
  const router = useRouter();
  const s = useStore();
  const [toast, setToast] = useState<string | null>(() => deriveToast(saved));
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const newNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) newNameRef.current?.focus();
  }, [creating]);

  function submitNewProject() {
    const created = addProject(newName);
    setCreating(false);
    setNewName("");
    if (created) router.push(`/project/${encodeURIComponent(created)}`);
  }

  // 확인 토스트 자동 dismiss (짧고 따뜻하게)
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const projects = projectsByRecency(s);
  const unclassified = countOf(s, null);
  const empty = projects.length === 0 && unclassified === 0;

  const q = query.trim();
  const results = searchMemos(s, q);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
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
                placeholder="메모 검색"
                aria-label="메모 검색"
                className="h-10 w-full rounded-[20px] bg-[#f0f0f0] pl-10 pr-4 text-[14px] text-[#222222] outline-none placeholder:text-[#999999]"
              />
            </div>
          </header>
        ) : (
          <header className="flex h-14 shrink-0 items-center justify-between pl-4 pr-2">
            <Link
              href="/home"
              aria-label="톡캐치 홈"
              className="flex items-center gap-3 rounded-md"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fee500]">
                <Sparkles size={16} className="text-[#1e1e1e]" strokeWidth={2.25} />
              </span>
              <span className="text-[22px] font-bold leading-none text-[#1e1e1e]">
                톡캐치
              </span>
            </Link>
            <div className="flex items-center">
              <Link
                href="/"
                aria-label="환영 화면"
                title="톡캐치 소개 화면"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                <Home size={22} />
              </Link>
              {!empty ? (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="검색"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                >
                  <Search size={22} />
                </button>
              ) : null}
              <Link
                href="/trash"
                aria-label="휴지통"
                title="휴지통"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                <Trash2 size={22} />
              </Link>
              <button
                type="button"
                aria-label="설정"
                title="설정은 곧 추가돼요"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#999999]"
              >
                <Settings size={22} />
              </button>
            </div>
          </header>
        )}

        {/* 던진 직후 확인 토스트 */}
        {toast && !searchOpen ? (
          <div className="px-4 pb-1 pt-1">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-2 text-[14px] text-[#333333] shadow-[0px_2px_6px_rgba(0,0,0,0.08)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fee500]">
                <Check size={13} className="text-[#1e1e1e]" strokeWidth={3} />
              </span>
              {toast}
            </div>
          </div>
        ) : null}

        {/* 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {searchOpen ? (
            <SearchBody query={q} results={results} router={router} />
          ) : empty ? (
            <EmptyBody />
          ) : (
            <ProjectList
              router={router}
              projects={projects}
              unclassified={unclassified}
            />
          )}
        </div>

        {/* 하단 고정 캡처 CTA */}
        {!searchOpen ? (
          <div className="flex shrink-0 gap-2 border-t border-[#f0f0f0] p-4">
            <button
              type="button"
              onClick={() => {
                setNewName("");
                setCreating(true);
              }}
              className="flex h-[54px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e5e5e5] text-[16px] font-bold text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <FolderPlus size={20} />
              프로젝트 만들기
            </button>
            <Link
              href="/capture"
              className="flex h-[54px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
            >
              <Plus size={20} />
              아이디어 던지기
            </Link>
          </div>
        ) : null}
      </div>

      {/* 새 프로젝트 만들기 */}
      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <button
            type="button"
            aria-label="취소"
            tabIndex={-1}
            onClick={() => setCreating(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div className="relative w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
            <p className="text-[16px] font-bold text-[#222222]">
              새 프로젝트 만들기
            </p>
            <input
              ref={newNameRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewProject();
                if (e.key === "Escape") setCreating(false);
              }}
              placeholder="예: 결제개편"
              aria-label="새 프로젝트 이름"
              className="mt-4 h-[52px] w-full rounded-xl border border-[#e5e5e5] px-4 text-[16px] text-[#222222] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#333333]"
            />
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="h-12 flex-1 rounded-xl border border-[#e5e5e5] text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitNewProject}
                disabled={!newName.trim()}
                className={`h-12 flex-1 rounded-xl bg-[#fee500] text-[15px] font-bold text-[#1e1e1e] transition-[transform,opacity] duration-150 ${
                  newName.trim()
                    ? "opacity-100 active:scale-[0.99]"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

type Router = ReturnType<typeof useRouter>;

function ProjectList({
  router,
  projects,
  unclassified,
}: {
  router: Router;
  projects: { name: string; count: number; shared: number }[];
  unclassified: number;
}) {
  return (
    <div className="px-3 py-2">
      {projects.map((p) => (
        <div
          key={p.name}
          className="flex h-[60px] w-full items-center gap-3 rounded-xl px-3 transition-colors hover:bg-[#f8f8f8]"
        >
          <button
            type="button"
            onClick={() => router.push(`/project/${encodeURIComponent(p.name)}`)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1e1e1e] bg-white text-[#1e1e1e]">
              <ProjectIcon name={p.name} size={20} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[16px] font-medium text-[#222222]">
              {p.name}
            </span>
          </button>
          {/* 팀 보드가 생성된 프로젝트(공유 메모 보유): 식별 표시 겸 보드 바로가기 */}
          {p.shared > 0 ? (
            <button
              type="button"
              onClick={() => router.push(`/board/${encodeURIComponent(p.name)}`)}
              aria-label={`${p.name} 팀 보드 보기`}
              title="팀 보드 보기"
              className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-[#e8f3fe] px-2 text-[12px] font-bold text-[#2196f3] transition-colors hover:bg-[#d6eafd] active:bg-[#c4e0fc]"
            >
              <Share2 size={13} />
              {p.shared}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push(`/project/${encodeURIComponent(p.name)}`)}
            aria-label={`${p.name} 열기`}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fee500] px-1.5 text-[12px] font-bold text-[#1e1e1e]">
              {p.count}
            </span>
            <ChevronRight size={18} className="text-[#cccccc]" />
          </button>
        </div>
      ))}

      {/* 미분류 — 별도 섹션 (나중에 정리 자리) */}
      {unclassified > 0 ? (
        <>
          <div className="my-1.5 h-px bg-[#f0f0f0]" />
          <button
            type="button"
            onClick={() => router.push(`/project/${encodeURIComponent("미분류")}`)}
            className="flex h-[60px] w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-[#f8f8f8] active:bg-[#f0f0f0]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f8f8] text-[#999999]">
              <Inbox size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[16px] text-[#666666]">
              미분류
            </span>
            <span className="text-[15px] text-[#999999]">{unclassified}</span>
            <ChevronRight size={18} className="text-[#cccccc]" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="text-[18px] font-bold leading-[1.44] text-[#222222]">
        아직 비어 있어요.
      </p>
      <p className="mt-2 text-[15px] leading-[1.5] text-[#666666]">
        떠오르는 걸 툭 던져보세요.
      </p>
    </div>
  );
}

function SearchBody({
  query,
  results,
  router,
}: {
  query: string;
  results: Memo[];
  router: Router;
}) {
  if (!query) {
    return (
      <p className="px-4 pt-6 text-[14px] text-[#999999]">
        메모를 검색해보세요.
      </p>
    );
  }
  if (results.length === 0) {
    return (
      <p className="px-4 pt-6 text-[14px] text-[#666666]">
        &apos;{query}&apos;에 맞는 메모가 없어요.
      </p>
    );
  }
  return (
    <div className="px-4 pt-3">
      <p className="mb-2 text-[13px] text-[#999999]">
        &apos;{query}&apos; 결과 {results.length}
      </p>
      <div className="flex flex-col gap-2">
        {results.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => router.push(`/memo/${m.id}`)}
            className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left transition-colors hover:bg-[#f8f8f8]"
          >
            <p className="truncate text-[15px] leading-[1.5] text-[#333333]">
              {m.text}
            </p>
            <p className="mt-1 text-[13px] text-[#999999]">
              {m.project ?? "미분류"} · {m.time}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
