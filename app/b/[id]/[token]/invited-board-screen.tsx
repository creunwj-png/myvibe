"use client";

import { useState } from "react";
import { Loader2, Lock, LogOut, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { decodeSnapshot, type BoardSnapshot } from "../../../lib/board-share";
import { useBoardComments, type BoardComment } from "../../../lib/board-comments";

type SnapMemo = BoardSnapshot["memos"][number];

/**
 * S010 공유 보드(외부 링크 뷰).
 * 전용 링크로 들어온 팀원이 카카오 로그인 후 그 보드만 보고 코멘트한다(샌드박스).
 * 홈·다른 프로젝트·다른 메모로 가는 길이 없다 — UI에 스냅샷의 메모만 노출(접근 제한은 화면 수준).
 * 코멘트는 Supabase(board_key=프로젝트)에 저장돼 팀 보드(S009)·다른 기기와 동기화된다.
 * Supabase가 없으면 로컬 스토어로 폴백하며, 그 땐 스냅샷 코멘트와 병합해 보여준다.
 * 상태: 손상 토큰 오류 / 로그인 게이트 / 인증 로딩 / 보드 뷰 / 코멘트 추가·삭제.
 * docs/mockups/screens.md S010 기준.
 */
export function InvitedBoardScreen({
  project,
  token,
}: {
  project: string;
  token: string;
}) {
  const snapshot = decodeSnapshot(token);
  // 보드명: 경로의 프로젝트를 우선, 없으면 스냅샷.
  const boardName = project || snapshot?.project || "팀";
  const { commentsFor, add, remove } = useBoardComments(
    project,
    snapshot?.comments
  );

  // 인증은 세션 상태(새로고침하면 게이트부터 다시 — 초대 로그인 취지에 맞음).
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  function kakao() {
    setLoading(true);
    setTimeout(() => {
      setAuthed(true);
      setLoading(false);
    }, 800);
  }
  function logout() {
    setAuthed(false);
  }

  // 손상/형식 불일치 토큰
  if (!snapshot) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-8 text-center">
        <p className="text-[16px] font-medium text-[#222222]">
          링크가 올바르지 않아요.
        </p>
        <p className="mt-2 text-[14px] leading-[1.5] text-[#666666]">
          보낸 사람에게 링크를 다시 받아보세요.
        </p>
      </main>
    );
  }

  // 로그인 게이트 — 안 하면 못 봄([나중에] 없음)
  if (!authed) {
    return (
      <main className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6">
          <header className="flex h-14 shrink-0 items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fee500]">
              <Sparkles size={16} className="text-[#1e1e1e]" strokeWidth={2.25} />
            </span>
            <span className="text-[22px] font-bold text-[#1e1e1e]">톡캐치</span>
          </header>

          <div className="flex flex-1 flex-col justify-center pb-10">
            <p className="text-[14px] font-bold text-[#2196f3]">팀 보드 초대</p>
            <h1 className="mt-2 text-[24px] font-bold leading-[1.35] text-[#1e1e1e]">
              ‘{boardName} 팀 보드’에
              <br />
              초대됐어요.
            </h1>
            <p className="mt-3 text-[15px] leading-[1.6] text-[#666666]">
              로그인하면 이 보드를 보고 코멘트할 수 있어요.
            </p>

            <button
              type="button"
              onClick={kakao}
              disabled={loading}
              className={`mt-8 flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#fee500] text-[16px] font-semibold text-[#000000] transition-transform duration-150 ${
                loading ? "opacity-60" : "active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MessageCircle size={18} fill="currentColor" />
              )}
              카카오 계정으로 로그인
            </button>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-[#999999]">
              <Lock size={13} />이 링크는 이 보드만 보여줘요.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 보드 뷰 — 샌드박스(뒤로·홈 없음)
  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold text-[#1e1e1e]">
            {boardName} 팀 보드
          </h1>
          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[14px] font-medium text-[#666666] transition-colors hover:bg-[#f8f8f8]"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-1 pb-6">
          <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-[#f8f8f8] px-3 py-2 text-[13px] text-[#808080]">
            <Lock size={13} className="shrink-0" />
            공유받은 보드예요 · 이 보드만 볼 수 있어요
          </p>

          {snapshot.memos.length === 0 ? (
            <p className="px-1 pt-6 text-[14px] text-[#999999]">
              이 보드엔 아직 공유된 아이디어가 없어요.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {snapshot.memos.map((m) => (
                <VisitorCard
                  key={m.id}
                  memo={m}
                  comments={commentsFor(m.id)}
                  onAdd={add}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function VisitorCard({
  memo,
  comments,
  onAdd,
  onDelete,
}: {
  memo: SnapMemo;
  comments: BoardComment[];
  onAdd: (memoId: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onAdd(memo.id, t);
    setDraft("");
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white">
      {/* 공유된 아이디어 — 본문(링크 아님, 샌드박스) */}
      <div className="px-4 pt-3.5 pb-3">
        <p className="whitespace-pre-wrap break-words text-[16px] font-medium leading-[1.5] text-[#222222]">
          {memo.text.replace(/\s+/g, " ").trim()}
        </p>
      </div>

      {/* 코멘트 스레드 */}
      <div className="border-t border-[#f0f0f0] px-4 py-3">
        {comments.length === 0 ? (
          <p className="text-[13px] text-[#bbbbbb]">아직 코멘트가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <Row
                key={c.id}
                author={c.author}
                text={c.text}
                time={c.time}
                mine={c.mine}
                onDelete={c.mine ? () => onDelete(c.id) : undefined}
              />
            ))}
          </ul>
        )}

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

function Row({
  author,
  text,
  time,
  mine,
  onDelete,
}: {
  author: string;
  text: string;
  time: string;
  mine: boolean;
  onDelete?: () => void;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
          mine ? "bg-[#1e1e1e] text-white" : "bg-[#e8f3fe] text-[#2196f3]"
        }`}
      >
        {author.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[13px]">
          <span className="font-bold text-[#333333]">{author}</span>
          <span className="text-[#bbbbbb]">· {time}</span>
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.5] text-[#333333]">
          {text}
        </p>
      </div>
      {mine && onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label="코멘트 삭제"
          className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#cccccc] transition-colors hover:bg-[#f8f8f8] hover:text-[#888888]"
        >
          <X size={15} />
        </button>
      ) : null}
    </li>
  );
}
