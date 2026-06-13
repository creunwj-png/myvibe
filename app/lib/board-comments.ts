"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseEnabled, supabase } from "./supabase";
import {
  addComment as addLocalComment,
  commentsOf,
  deleteComment as deleteLocalComment,
  useStore,
} from "./store";

// 팀 보드 댓글 데이터 계층(FR-013·019).
// - Supabase 켜져 있으면 board_comments 테이블에 저장 → 사람·기기 간 동기화.
// - 꺼져 있으면(env 없음) 기존 로컬 스토어로 폴백(배포가 안 깨지게).
// board_key = 보드(프로젝트명). 익명 공개 정책(목업) — 실권한은 범위 밖.

export type BoardComment = {
  id: string;
  memoId: string;
  author: string;
  text: string;
  time: string;
  mine: boolean;
};

type SnapshotComment = {
  id: string;
  memoId: string;
  author: string;
  text: string;
  time: string;
};

type Row = {
  id: string;
  memo_id: string;
  author: string;
  body: string;
  created_at: string;
};

// 인증이 없는 목업이라, 이 브라우저가 단 댓글 id를 로컬에 기억해 "내 것"(삭제 가능)으로 표시.
const MINE_KEY = "tokcatch.myCommentIds";
function readMine(): Set<string> {
  try {
    const a = JSON.parse(localStorage.getItem(MINE_KEY) || "[]");
    return new Set<string>(Array.isArray(a) ? a : []);
  } catch {
    return new Set<string>();
  }
}
function markMine(id: string) {
  try {
    const s = readMine();
    s.add(id);
    localStorage.setItem(MINE_KEY, JSON.stringify([...s]));
  } catch {
    // 무시
  }
}
function unmarkMine(id: string) {
  try {
    const s = readMine();
    s.delete(id);
    localStorage.setItem(MINE_KEY, JSON.stringify([...s]));
  } catch {
    // 무시
  }
}

function timeLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / 3_600_000;
  if (h < 1) return "방금";
  if (h < 24) return `${Math.floor(h)}시간 전`;
  const d = Math.floor(h / 24);
  return d === 1 ? "어제" : `${d}일 전`;
}

// Supabase에서 한 보드의 댓글을 읽어 표시용으로 매핑한다(모듈 스코프 — effect에서 .then으로 사용).
async function loadComments(boardKey: string): Promise<BoardComment[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from("board_comments")
    .select("id,memo_id,author,body,created_at")
    .eq("board_key", boardKey)
    .order("created_at", { ascending: true });
  if (error || !data) {
    // 조용히 빈 목록으로 폴백하면 설정/권한 오류(잘못된 키·RLS)가 "댓글 없음"으로 묻힌다 — 콘솔에 남긴다.
    if (error) console.error("[board-comments] 댓글 불러오기 실패", error);
    return [];
  }
  const mine = readMine();
  return (data as Row[]).map((r) => ({
    id: r.id,
    memoId: r.memo_id,
    author: r.author,
    text: r.body,
    time: timeLabel(r.created_at),
    mine: mine.has(r.id),
  }));
}

/**
 * 한 보드(프로젝트)의 댓글을 다룬다.
 * 반환: commentsFor(memoId) / add(memoId, text) / remove(id) / loading.
 * snapshotComments는 로컬 폴백(외부 뷰)에서만 병합에 쓰인다.
 */
export function useBoardComments(
  boardKey: string,
  snapshotComments?: SnapshotComment[]
) {
  const store = useStore();
  const [rows, setRows] = useState<BoardComment[] | null>(null);

  useEffect(() => {
    if (!isSupabaseEnabled) return;
    let active = true;
    loadComments(boardKey).then((list) => {
      if (active) setRows(list);
    });
    return () => {
      active = false;
    };
  }, [boardKey]);

  const add = useCallback(
    async (memoId: string, text: string) => {
      const t = text.trim();
      if (!t) return;
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase
          .from("board_comments")
          .insert({ board_key: boardKey, memo_id: memoId, author: "나", body: t })
          .select("id")
          .single();
        if (error) console.error("[board-comments] 댓글 등록 실패", error);
        if (data?.id) markMine(data.id as string);
        setRows(await loadComments(boardKey));
      } else {
        addLocalComment(memoId, t);
      }
    },
    [boardKey]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.from("board_comments").delete().eq("id", id);
        if (error) console.error("[board-comments] 댓글 삭제 실패", error);
        unmarkMine(id);
        setRows(await loadComments(boardKey));
      } else {
        deleteLocalComment(id);
      }
    },
    [boardKey]
  );

  const commentsFor = useCallback(
    (memoId: string): BoardComment[] => {
      if (isSupabaseEnabled) {
        return (rows ?? []).filter((c) => c.memoId === memoId);
      }
      // 로컬 폴백: 메인 스토어 댓글(+ 외부 뷰면 스냅샷 병합)
      const local = commentsOf(store, memoId).map((c) => ({
        id: c.id,
        memoId: c.memoId,
        author: c.author,
        text: c.text,
        time: c.time,
        mine: c.mine,
      }));
      if (!snapshotComments) return local;
      const haveId = new Set(local.map((c) => c.id));
      const snapOnly = snapshotComments
        .filter((c) => c.memoId === memoId && !haveId.has(c.id))
        .map((c) => ({ ...c, mine: false }));
      return [...snapOnly, ...local];
    },
    [rows, store, snapshotComments]
  );

  return { commentsFor, add, remove, loading: isSupabaseEnabled && rows === null };
}
