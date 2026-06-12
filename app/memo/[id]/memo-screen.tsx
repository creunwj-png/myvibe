"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Home,
  MoreVertical,
  Pencil,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import { ProjectIcon } from "../../lib/project-icon";
import {
  deleteMemo,
  getMemo,
  reclassifyMemo,
  restoreMemo,
  updateMemoText,
  useStore,
  type Memo,
} from "../../lib/store";

const UNCLASSIFIED_LABEL = "분류 없음";

function projectHref(project: string | null) {
  return `/project/${encodeURIComponent(project ?? "미분류")}`;
}

/**
 * S006 메모 상세·편집.
 * 메모를 다듬고(인라인 편집), 잘못 분류된 건 재분류, 필요 없으면 삭제(확인·되돌리기).
 * 공유의 진입점([팀에 공유하기] → S007). 데이터는 공용 스토어(app/lib/store).
 * docs/mockups/screens.md S006 기준.
 */
export function MemoScreen({ id }: { id: string }) {
  const s = useStore();
  const memo = getMemo(s, id);

  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reclassifyOpen, setReclassifyOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedMemo, setDeletedMemo] = useState<Memo | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (editing) {
      const el = taRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [editing]);

  // 삭제 후 — 되돌리기 상태
  if (deletedMemo) {
    return (
      <main className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center px-2">
            <Link
              href={projectHref(deletedMemo.project)}
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
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-[16px] text-[#666666]">삭제했어요.</p>
            <button
              type="button"
              onClick={() => {
                restoreMemo(deletedMemo);
                setDeletedMemo(null);
              }}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-[#e5e5e5] px-4 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <RotateCcw size={16} />
              되돌리기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 메모를 찾을 수 없음 (잘못된 링크 등)
  if (!memo) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-8 text-center">
        <p className="text-[16px] text-[#666666]">메모를 찾을 수 없어요.</p>
        <Link
          href="/home"
          className="mt-5 inline-flex h-12 items-center justify-center rounded-xl border border-[#e5e5e5] px-6 text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
        >
          홈으로
        </Link>
      </main>
    );
  }

  const projectLabel = memo.project ?? UNCLASSIFIED_LABEL;
  const options = [...s.projects.map((p) => p.name), UNCLASSIFIED_LABEL];

  function startEdit() {
    setText(memo!.text);
    setMenuOpen(false);
    setEditing(true);
  }
  function finishEdit() {
    updateMemoText(id, text);
    setEditing(false);
  }
  function chooseProject(opt: string) {
    reclassifyMemo(id, opt === UNCLASSIFIED_LABEL ? null : opt);
    setReclassifyOpen(false);
  }
  function confirmDeleteNow() {
    setConfirmDelete(false);
    setDeletedMemo(memo!);
    deleteMemo(id);
  }

  return (
    <main className="relative flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between pl-1 pr-2">
          <div className="flex items-center">
            <Link
              href={projectHref(memo.project)}
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
          </div>

          {editing ? (
            <button
              type="button"
              onClick={finishEdit}
              className="flex h-9 items-center rounded-lg px-3 text-[15px] font-bold text-[#1e1e1e]"
            >
              완료
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="메모 메뉴"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                <MoreVertical size={22} />
              </button>
              {menuOpen ? (
                <div className="absolute right-1 top-11 z-50 w-36 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-[0px_2px_6px_rgba(0,0,0,0.08)]">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                  >
                    <Pencil size={16} />
                    수정
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
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </header>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-4">
          {editing ? (
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={finishEdit}
              aria-label="메모 본문"
              className="mt-2 min-h-[120px] w-full resize-none bg-transparent text-[18px] leading-[1.6] text-[#222222] outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="mt-2 block w-full whitespace-pre-wrap text-left text-[18px] leading-[1.6] text-[#222222]"
            >
              {memo.text}
            </button>
          )}

          {/* 메타: 재분류 + 시각 + 개인/공유 */}
          <div className="mt-6">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setReclassifyOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] py-1.5 pl-2.5 pr-2 text-[14px] text-[#333333] transition-colors hover:bg-[#f8f8f8]"
              >
                <ProjectIcon name={projectLabel} size={15} className="text-[#808080]" />
                {projectLabel}
                <ChevronDown size={15} className="text-[#999999]" />
              </button>
              {reclassifyOpen ? (
                <div className="absolute left-0 top-10 z-50 max-h-64 w-44 overflow-y-auto rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-[0px_2px_6px_rgba(0,0,0,0.08)]">
                  {options.map((opt) => {
                    const active = opt === projectLabel;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => chooseProject(opt)}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] text-[#333333] transition-colors hover:bg-[#f8f8f8]"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            active ? "border-[#1e1e1e]" : "border-[#cccccc]"
                          }`}
                        >
                          {active ? (
                            <span className="h-2 w-2 rounded-full bg-[#1e1e1e]" />
                          ) : null}
                        </span>
                        <ProjectIcon name={opt} size={16} className="shrink-0 text-[#808080]" />
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <p className="mt-2 text-[13px] text-[#999999]">
              {memo.time} ·{" "}
              <span className={memo.shared ? "text-[#2196f3]" : "text-[#999999]"}>
                {memo.shared ? "공유됨" : "개인"}
              </span>
            </p>
          </div>
        </div>

        {/* 하단 고정 — 팀에 공유하기 */}
        <div className="shrink-0 border-t border-[#f0f0f0] p-4">
          <Link
            href={`/share/${id}`}
            className="flex h-[54px] items-center justify-center gap-1.5 rounded-xl bg-[#fee500] text-[16px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
          >
            <Share2 size={18} />
            팀에 공유하기
          </Link>
        </div>
      </div>

      {/* 팝오버 바깥 클릭 닫기 */}
      {menuOpen || reclassifyOpen ? (
        <button
          type="button"
          aria-label="닫기"
          tabIndex={-1}
          onClick={() => {
            setMenuOpen(false);
            setReclassifyOpen(false);
          }}
          className="fixed inset-0 z-40 cursor-default"
        />
      ) : null}

      {/* 삭제 확인 다이얼로그 */}
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
              이 메모를 삭제할까요?
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
                onClick={confirmDeleteNow}
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
