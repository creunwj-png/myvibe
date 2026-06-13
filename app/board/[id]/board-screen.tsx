"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Home, Link2, Send, Share2, X } from "lucide-react";
import {
  addComment,
  commentsOf,
  deleteComment,
  sharedMemosOf,
  useStore,
  type Comment,
  type Memo,
  type State,
} from "../../lib/store";
import { encodeSnapshot, type BoardSnapshot } from "../../lib/board-share";

/**
 * S009 팀 보드.
 * 한 프로젝트에서 "공유"한 메모만 모이는, 팀과 함께 보는 공간(프로젝트 1 : 보드 1).
 * 보드는 파생값 — 그 프로젝트의 shared 메모 집합(최근 공유순).
 * 각 카드에서 코멘트(FR-013)를 달고 지운다 — 내 코멘트는 "나", 팀원 코멘트는 시드.
 * 상태: Default(공유 메모 + 코멘트 스레드) / 빈 보드(공유 0개) / 빈 스레드(코멘트 0개).
 * docs/mockups/screens.md S009 기준.
 */
export function BoardScreen({ name }: { name: string }) {
  const isUnclassified = name === "미분류";
  const s = useStore();
  const memos = sharedMemosOf(s, isUnclassified ? null : name);
  const projectHref = `/project/${encodeURIComponent(name)}`;
  const [shareOpen, setShareOpen] = useState(false);

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
          {memos.length > 0 ? (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label="공유 링크 만들기"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <Share2 size={20} />
            </button>
          ) : null}
        </header>

        {/* 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {memos.length === 0 ? (
            <EmptyBody projectHref={projectHref} />
          ) : (
            <div className="px-4 pt-2 pb-6">
              <p className="flex items-center gap-1.5 px-1 pb-2 text-[13px] text-[#999999]">
                <Share2 size={13} className="text-[#2196f3]" />
                팀과 함께 보는 공유 메모
              </p>
              <div className="flex flex-col gap-3">
                {memos.map((m) => (
                  <BoardCard key={m.id} memo={m} comments={commentsOf(s, m.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {shareOpen ? (
        <ShareSheet
          snapshot={buildSnapshot(s, name, memos)}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </main>
  );
}

/** 현재 보드를 공유 링크용 스냅샷으로 만든다(메모 + 그 메모들의 코멘트). */
function buildSnapshot(s: State, name: string, memos: Memo[]): BoardSnapshot {
  return {
    v: 1,
    project: name,
    memos: memos.map((m) => ({ id: m.id, text: m.text, time: m.time })),
    comments: memos.flatMap((m) =>
      commentsOf(s, m.id).map((c) => ({
        id: c.id,
        memoId: c.memoId,
        author: c.author,
        text: c.text,
        time: c.time,
      }))
    ),
  };
}

function ShareSheet({
  snapshot,
  onClose,
}: {
  snapshot: BoardSnapshot;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // origin은 클라이언트에서만 — 마운트 시점에 만든다.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // 경로에 프로젝트를 앞세워 보드 단위로 URL이 눈에 띄게 구분되게 한다.
  // 뒤의 토큰은 백엔드가 없어 보드 내용(스냅샷)을 담는 부분.
  const url = `${origin}/b/${encodeURIComponent(snapshot.project)}/${encodeSnapshot(
    snapshot
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드 거부 시 선택 폴백
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div className="relative w-full max-w-[480px] rounded-t-2xl bg-white p-5 pb-7 shadow-[0px_-2px_12px_rgba(0,0,0,0.12)] sm:rounded-2xl sm:pb-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f3fe]">
            <Link2 size={18} className="text-[#2196f3]" />
          </span>
          <p className="text-[17px] font-bold text-[#1e1e1e]">팀 보드 공유</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#999999] transition-colors hover:bg-[#f8f8f8]"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 text-[14px] leading-[1.5] text-[#666666]">
          링크를 받은 팀원은 카카오 로그인 후 <b className="font-bold text-[#333333]">이 보드만</b> 보고 코멘트할 수 있어요.
        </p>

        <div className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#f8f8f8] py-2 pl-3 pr-2">
          <input
            readOnly
            value={url}
            aria-label="공유 링크"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate bg-transparent text-[13px] text-[#666666] outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold transition-colors ${
              copied
                ? "bg-[#e8f3fe] text-[#2196f3]"
                : "bg-[#1e1e1e] text-white active:scale-[0.98]"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BoardCard({ memo, comments }: { memo: Memo; comments: Comment[] }) {
  const [draft, setDraft] = useState("");

  function submit() {
    const t = draft.trim();
    if (!t) return;
    addComment(memo.id, t);
    setDraft("");
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white">
      {/* 공유된 메모 본문 — 탭하면 원문(S006) */}
      <Link
        href={`/memo/${memo.id}`}
        className="block rounded-t-xl px-4 pt-3.5 pb-3 transition-colors hover:bg-[#f8f8f8] active:bg-[#f0f0f0]"
      >
        <p className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#222222]">
          {memo.text.replace(/\s+/g, " ").trim()}
        </p>
        <p className="mt-2 text-[13px] text-[#2196f3]">내가 올림 · {memo.time}</p>
      </Link>

      {/* 코멘트 스레드 */}
      <div className="border-t border-[#f0f0f0] px-4 py-3">
        {comments.length === 0 ? (
          <p className="text-[13px] text-[#bbbbbb]">아직 코멘트가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}
          </ul>
        )}

        {/* 코멘트 입력 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-3 flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="코멘트 달기…"
            aria-label="코멘트 입력"
            className="h-10 min-w-0 flex-1 rounded-full bg-[#f0f0f0] px-4 text-[14px] text-[#222222] outline-none placeholder:text-[#999999] focus:bg-[#ebebeb]"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="코멘트 등록"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[transform,opacity] duration-150 ${
              draft.trim()
                ? "bg-[#fee500] text-[#1e1e1e] active:scale-[0.96]"
                : "cursor-not-allowed bg-[#f0f0f0] text-[#bbbbbb]"
            }`}
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
          comment.mine
            ? "bg-[#1e1e1e] text-white"
            : "bg-[#e8f3fe] text-[#2196f3]"
        }`}
      >
        {comment.author.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[13px]">
          <span className="font-bold text-[#333333]">{comment.author}</span>
          <span className="text-[#bbbbbb]">· {comment.time}</span>
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.5] text-[#333333]">
          {comment.text}
        </p>
      </div>
      {comment.mine ? (
        <button
          type="button"
          onClick={() => deleteComment(comment.id)}
          aria-label="코멘트 삭제"
          className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#cccccc] transition-colors hover:bg-[#f8f8f8] hover:text-[#888888]"
        >
          <X size={15} />
        </button>
      ) : null}
    </li>
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
