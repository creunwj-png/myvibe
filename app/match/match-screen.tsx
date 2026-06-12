"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Folder, Plus, X } from "lucide-react";

type Recommendation = { name: string; count: number; likely?: boolean };

// 더미 추천 프로젝트 (docs/mockups/screens.md Global Mockup Assumptions)
const RECOMMENDATIONS: Recommendation[] = [
  { name: "결제개편", count: 5, likely: true },
  { name: "온보딩리뉴얼", count: 3 },
  { name: "검색고도화", count: 2 },
];

/**
 * S003 AI 매칭 & 분류.
 * 던진 내용을 위에 고정하고 같은 화면에서 추천을 펼친다 — 반자동(추천 → 1탭) 분류.
 * - 케이스 A: 추천 칩(첫 칩 ‹유력›) / 케이스 B(fresh): 즉석 등록 입력
 * - loading: 추천 산출 스켈레톤 / error: 케이스 B 형태로 폴백(메모 보존)
 * 옐로는 ‹유력›·Primary CTA·칩 선택 채움에만 사용.
 * docs/mockups/screens.md S003 기준.
 */
export function MatchScreen({
  text,
  fresh,
  loading,
  error,
}: {
  text: string;
  fresh: boolean;
  loading: boolean;
  error: boolean;
}) {
  const router = useRouter();
  const projectsExist = !fresh && !error;
  // 추천이 없으면(케이스 B·에러 폴백) 곧장 '만들기' 뷰로 시작
  const [view, setView] = useState<"recommend" | "create">(
    projectsExist ? "recommend" : "create"
  );
  const [newName, setNewName] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === "create") nameRef.current?.focus();
  }, [view]);

  function goHome(saved: string) {
    router.push(`/home?saved=${encodeURIComponent(saved)}`);
  }

  function selectChip(name: string) {
    if (selecting) return;
    setSelecting(name); // 옐로 채움 → 잠깐 보이고 전이
    setTimeout(() => goHome(name), 280);
  }

  function createAndSave() {
    const name = newName.trim();
    if (!name) return;
    goHome(name);
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pb-8">
        {/* 닫기 */}
        <header className="-mx-2 flex items-center pt-2">
          <button
            type="button"
            onClick={() => router.push("/home")}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <X size={24} />
          </button>
        </header>

        {/* 방금 던진 내용 — 상단 고정 (중립 Plain Bubble) */}
        <div className="mt-1 self-start rounded-[18px] rounded-tl-[4px] border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-[14px] leading-[1.5] text-[#333333]">
          {text}
        </div>

        {view === "recommend" ? (
          <RecommendView
            loading={loading}
            selecting={selecting}
            onSelect={selectChip}
            onNew={() => setView("create")}
            onSkip={() => goHome("__none__")}
          />
        ) : (
          <CreateView
            projectsExist={projectsExist}
            error={error}
            value={newName}
            inputRef={nameRef}
            onChange={setNewName}
            onSubmit={createAndSave}
            onBack={projectsExist ? () => setView("recommend") : undefined}
            onSkip={() => goHome("__none__")}
          />
        )}
      </div>
    </main>
  );
}

/* 케이스 A — 추천 모드 */
function RecommendView({
  loading,
  selecting,
  onSelect,
  onNew,
  onSkip,
}: {
  loading: boolean;
  selecting: string | null;
  onSelect: (name: string) => void;
  onNew: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <h1 className="mt-7 text-[20px] font-bold leading-[1.4] text-[#1e1e1e]">
        어디로 갈까요?
      </h1>

      <div className="mt-4 flex flex-col gap-2.5">
        {loading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[60px] animate-pulse rounded-xl bg-[#f0f0f0]"
              />
            ))
          : RECOMMENDATIONS.map((p) => {
              const chosen = selecting === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onSelect(p.name)}
                  className={`flex h-[60px] items-center gap-3 rounded-xl border px-4 text-left transition-colors ${
                    chosen
                      ? "border-transparent bg-[#fee500]"
                      : "border-[#e5e5e5] bg-white active:bg-[#f8f8f8]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      chosen ? "text-[#1e1e1e]" : "text-[#999999]"
                    }`}
                  >
                    {chosen ? <Check size={20} /> : <Folder size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium text-[#222222]">
                      {p.name}
                    </span>
                    <span className="block text-[13px] text-[#999999]">
                      메모 {p.count}개
                    </span>
                  </span>
                  {p.likely && !chosen ? (
                    <span className="shrink-0 rounded-full bg-[#fee500] px-2 py-0.5 text-[12px] font-bold text-[#1e1e1e]">
                      유력
                    </span>
                  ) : null}
                </button>
              );
            })}
      </div>

      {/* 또는 */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e5e5e5]" />
        <span className="text-[13px] text-[#999999]">또는</span>
        <span className="h-px flex-1 bg-[#e5e5e5]" />
      </div>

      <button
        type="button"
        onClick={onNew}
        className="flex h-[52px] items-center justify-center gap-1.5 rounded-xl border border-[#e5e5e5] text-[16px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
      >
        <Plus size={18} />새 프로젝트
      </button>

      <SkipButton onSkip={onSkip} />
    </>
  );
}

/* 케이스 B / 에러 폴백 — 즉석 등록 */
function CreateView({
  projectsExist,
  error,
  value,
  inputRef,
  onChange,
  onSubmit,
  onBack,
  onSkip,
}: {
  projectsExist: boolean;
  error: boolean;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  onSkip: () => void;
}) {
  const canSubmit = value.trim().length > 0;
  return (
    <>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-5 -ml-1 flex items-center gap-1 self-start text-[14px] text-[#666666]"
        >
          <ArrowLeft size={16} />
          추천으로
        </button>
      ) : null}

      {error ? (
        <p className="mt-6 text-[14px] leading-[1.5] text-[#808080]">
          추천을 잠깐 못 불러왔어요. 직접 담아볼게요.
        </p>
      ) : null}

      <h1
        className={`text-[20px] font-bold leading-[1.4] text-[#1e1e1e] ${
          error ? "mt-2" : onBack ? "mt-5" : "mt-7"
        }`}
      >
        {projectsExist
          ? "새 프로젝트 만들기"
          : "담을 프로젝트가 아직 없네요."}
        {!projectsExist ? (
          <span className="block font-medium text-[#666666]">
            새로 만들까요?
          </span>
        ) : null}
      </h1>

      <label className="mt-6 block text-[13px] font-medium text-[#666666]">
        프로젝트 이름
      </label>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="예: 결제개편"
        aria-label="새 프로젝트 이름"
        className="mt-2 h-[52px] w-full rounded-xl border border-[#e5e5e5] px-4 text-[16px] text-[#222222] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#333333]"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-5 flex h-[54px] items-center justify-center rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-[transform,opacity] duration-150 ${
          canSubmit ? "opacity-100 active:scale-[0.99]" : "cursor-not-allowed opacity-50"
        }`}
      >
        만들고 담기
      </button>

      <SkipButton onSkip={onSkip} />
    </>
  );
}

/* 보조 — 부담 없이 빠져나가는 [분류 없이 저장] */
function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="mx-auto mt-4 flex h-11 items-center justify-center px-4 text-[14px] text-[#808080] transition-colors hover:text-[#333333]"
    >
      분류 없이 저장
    </button>
  );
}
