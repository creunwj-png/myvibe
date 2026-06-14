"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseEnabled, supabase } from "./supabase";

// 공유 데이터 스토어.
// - Supabase 켜져 있으면(env 설정) projects·memos를 Supabase에 영구 저장한다 →
//   기기·사람 간 동기화, 진짜 삭제. 진입 시 1회 로드, 변경은 낙관적 반영 후 미러링.
// - 꺼져 있으면 localStorage로 폴백(env 없이도 배포가 안 깨지게).
// 화면들은 이 동기 selector API를 그대로 쓴다 — 저장 계층만 여기서 교체된다.
// 인증은 목업이라 사용자 분리 없음(프로덕션 URL = 하나의 공유 워크스페이스).

export type Memo = {
  id: string;
  text: string;
  project: string | null; // 프로젝트명 또는 null(미분류)
  shared: boolean;
  time: string; // 표시용 상대 시각 라벨(createdAt에서 파생)
  createdAt: number; // 정렬용(epoch ms)
};

export type Project = { name: string; createdAt: number };

// 팀 보드 코멘트(FR-013). Supabase 켜지면 board-comments.ts가 처리하고,
// 이 스토어의 comments는 로컬 폴백·외부 공유 뷰에서만 쓰인다.
export type Comment = {
  id: string;
  memoId: string;
  author: string;
  mine: boolean;
  text: string;
  time: string;
  createdAt: number;
};

// memos = 활성 메모, trash = 소프트 삭제된 메모(휴지통).
export type State = {
  projects: Project[];
  memos: Memo[];
  comments: Comment[];
  trash: Memo[];
};

const KEY = "tokcatch.v1";
const SAVE_FAIL_MSG = "저장에 실패했어요. 잠시 후 다시 시도해주세요.";

// 시드 없음 — 프로덕션/로컬 모두 빈 상태로 시작한다.
const EMPTY: State = { projects: [], memos: [], comments: [], trash: [] };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
const errorListeners = new Set<(msg: string) => void>();

function emit() {
  listeners.forEach((l) => l());
}

function emitError(msg: string) {
  errorListeners.forEach((l) => l(msg));
}

/** 저장 실패 등 사용자에게 알릴 에러를 구독한다(최상위 토스터에서 사용). */
export function onError(cb: (msg: string) => void) {
  errorListeners.add(cb);
  return () => {
    errorListeners.delete(cb);
  };
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 무시 (오프라인 캐시)
  }
}

// 부분 갱신을 머지한다 — 액션이 일부 필드만 넘겨도 나머지가 보존된다.
function setState(next: Partial<State>) {
  state = { ...state, ...next };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

// ---- Supabase 매핑 ----

type MemoRow = {
  id: string;
  text: string;
  project: string | null;
  shared: boolean;
  created_at: string;
  deleted_at: string | null;
};

function timeLabel(createdAt: number): string {
  const h = (Date.now() - createdAt) / 3_600_000;
  if (h < 1) return "방금";
  if (h < 24) return `${Math.floor(h)}시간 전`;
  const d = Math.floor(h / 24);
  return d === 1 ? "어제" : `${d}일 전`;
}

function rowToMemo(r: MemoRow): Memo {
  const createdAt = new Date(r.created_at).getTime();
  return {
    id: r.id,
    text: r.text,
    project: r.project,
    shared: r.shared,
    createdAt,
    time: timeLabel(createdAt),
  };
}

function memoPayload(m: Memo, deletedAt: string | null) {
  return {
    id: m.id,
    text: m.text,
    project: m.project,
    shared: m.shared,
    created_at: new Date(m.createdAt).toISOString(),
    deleted_at: deletedAt,
  };
}

// 미러링: 실패하면 콘솔 로깅 + 에러 토스트. 본문 화면은 낙관적 반영을 유지한다.
function mirror(fn: () => Promise<void>, failMsg: string) {
  if (!isSupabaseEnabled || !supabase) return;
  fn().catch((e) => {
    console.error("[store] " + failMsg, e);
    emitError(SAVE_FAIL_MSG);
  });
}

async function exec(q: PromiseLike<{ error: unknown }>) {
  const { error } = await q;
  if (error) throw error;
}

async function upsertProjectRow(p: Project) {
  if (!supabase) return;
  await exec(
    supabase
      .from("projects")
      .upsert({ name: p.name, created_at: new Date(p.createdAt).toISOString() })
  );
}

// ---- 하이드레이션 ----

async function hydrateFromSupabase() {
  if (!supabase) return;
  const [memosRes, projectsRes] = await Promise.all([
    supabase
      .from("memos")
      .select("id,text,project,shared,created_at,deleted_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("name,created_at")
      .order("created_at", { ascending: true }),
  ]);
  if (memosRes.error || projectsRes.error) {
    console.error("[store] 불러오기 실패", memosRes.error ?? projectsRes.error);
    emitError("데이터를 불러오지 못했어요. 새로고침해 주세요.");
    return;
  }
  const memos: Memo[] = [];
  const trash: Memo[] = [];
  for (const r of (memosRes.data ?? []) as MemoRow[]) {
    const m = rowToMemo(r);
    if (r.deleted_at) trash.push(m);
    else memos.push(m);
  }
  const projects: Project[] = (projectsRes.data ?? []).map((p) => ({
    name: p.name as string,
    createdAt: new Date(p.created_at as string).getTime(),
  }));
  setState({ projects, memos, trash, comments: [] });
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;

  if (isSupabaseEnabled && supabase) {
    void hydrateFromSupabase();
    return;
  }

  // localStorage 폴백
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.memos)) {
        state = {
          projects: parsed.projects,
          memos: parsed.memos,
          comments: Array.isArray(parsed.comments) ? parsed.comments : [],
          trash: Array.isArray(parsed.trash) ? parsed.trash : [],
        };
        emit();
      }
    }
  } catch {
    // 무시
  }
}

/** 스토어 상태를 구독한다. 마운트 시 Supabase(또는 localStorage)에서 1회 하이드레이션. */
export function useStore(): State {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    hydrate();
  }, []);
  return snap;
}

// ---- 파생 셀렉터 ----

export function memosOf(s: State, project: string | null): Memo[] {
  return s.memos
    .filter((m) => m.project === project)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function countOf(s: State, project: string | null): number {
  return s.memos.filter((m) => m.project === project).length;
}

/** 한 프로젝트의 팀 보드 = 그 프로젝트에서 공유한 메모(shared)들. 최근 공유순. */
export function sharedMemosOf(s: State, project: string | null): Memo[] {
  return s.memos
    .filter((m) => m.project === project && m.shared)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** 팀 보드 진입 노출/배지용: 그 프로젝트의 공유 메모 수. */
export function sharedCountOf(s: State, project: string | null): number {
  return s.memos.filter((m) => m.project === project && m.shared).length;
}

/** 한 메모의 코멘트(오래된→최신). */
export function commentsOf(s: State, memoId: string): Comment[] {
  return s.comments
    .filter((c) => c.memoId === memoId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** 한 메모의 코멘트 수. */
export function commentCountOf(s: State, memoId: string): number {
  return s.comments.filter((c) => c.memoId === memoId).length;
}

/** 휴지통 메모(최근 삭제순 — 삭제 시 앞에 추가하므로 배열 순서 그대로). */
export function trashMemos(s: State): Memo[] {
  return s.trash;
}

/**
 * 홈 표시용: 프로젝트를 최근 활동순(프로젝트 내 최신 메모 기준)으로 정렬.
 * shared = 그 프로젝트의 공유 메모 수(>0이면 팀 보드가 생성된 프로젝트).
 */
export function projectsByRecency(
  s: State
): { name: string; count: number; shared: number }[] {
  const lastActivity = (name: string) => {
    const times = s.memos.filter((m) => m.project === name).map((m) => m.createdAt);
    const proj = s.projects.find((p) => p.name === name);
    return times.length ? Math.max(...times) : proj?.createdAt ?? 0;
  };
  return [...s.projects]
    .sort((a, b) => lastActivity(b.name) - lastActivity(a.name))
    .map((p) => ({
      name: p.name,
      count: countOf(s, p.name),
      shared: sharedCountOf(s, p.name),
    }));
}

export function getMemo(s: State, id: string): Memo | undefined {
  return s.memos.find((m) => m.id === id);
}

export function searchMemos(s: State, q: string): Memo[] {
  const query = q.trim();
  if (!query) return [];
  return s.memos
    .filter((m) => m.text.includes(query))
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ---- 액션 ----

function newId() {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// 로컬 state에 프로젝트가 없으면 추가하고, 새로 생긴 프로젝트를 반환(없으면 null).
function ensureProjectLocal(name: string): { projects: Project[]; created: Project | null } {
  const existing = state.projects.find((p) => p.name === name);
  if (existing) return { projects: state.projects, created: null };
  const created = { name, createdAt: Date.now() };
  return { projects: [...state.projects, created], created };
}

/**
 * 던진 내용을 분류해 저장한다.
 * target: 기존 프로젝트명 / 새 프로젝트명 / null(미분류)
 * 반환: 생성된 메모 id
 */
export function throwAndClassify(text: string, target: string | null): string {
  const id = newId();
  const memo: Memo = {
    id,
    text: text.trim(),
    project: target,
    shared: false,
    time: "방금",
    createdAt: Date.now(),
  };
  const { projects, created } = target
    ? ensureProjectLocal(target)
    : { projects: state.projects, created: null };
  setState({ projects, memos: [memo, ...state.memos] });
  mirror(async () => {
    if (created) await upsertProjectRow(created); // FK: 메모보다 먼저
    if (!supabase) return;
    await exec(supabase.from("memos").upsert(memoPayload(memo, null)));
  }, "메모 저장 실패");
  return id;
}

export function updateMemoText(id: string, text: string) {
  const trimmed = text.trim();
  setState({
    memos: state.memos.map((m) => (m.id === id ? { ...m, text: trimmed } : m)),
  });
  mirror(async () => {
    if (!supabase) return;
    await exec(supabase.from("memos").update({ text: trimmed }).eq("id", id));
  }, "메모 수정 실패");
}

export function reclassifyMemo(id: string, project: string | null) {
  const { projects, created } = project
    ? ensureProjectLocal(project)
    : { projects: state.projects, created: null };
  setState({
    projects,
    memos: state.memos.map((m) => (m.id === id ? { ...m, project } : m)),
  });
  mirror(async () => {
    if (created) await upsertProjectRow(created);
    if (!supabase) return;
    await exec(supabase.from("memos").update({ project }).eq("id", id));
  }, "재분류 저장 실패");
}

/** 메모를 휴지통으로 보낸다(소프트 삭제). 복원 가능. */
export function deleteMemo(id: string) {
  const memo = state.memos.find((m) => m.id === id);
  if (!memo) return;
  setState({
    memos: state.memos.filter((m) => m.id !== id),
    trash: [memo, ...state.trash],
  });
  mirror(async () => {
    if (!supabase) return;
    await exec(
      supabase.from("memos").update({ deleted_at: new Date().toISOString() }).eq("id", id)
    );
  }, "삭제 저장 실패");
}

/** 휴지통/되돌리기에서 메모를 되살린다. */
export function restoreMemo(memo: Memo) {
  if (state.memos.some((m) => m.id === memo.id)) return;
  const { projects, created } = memo.project
    ? ensureProjectLocal(memo.project)
    : { projects: state.projects, created: null };
  setState({
    projects,
    memos: [memo, ...state.memos],
    trash: state.trash.filter((m) => m.id !== memo.id),
  });
  mirror(async () => {
    if (created) await upsertProjectRow(created);
    if (!supabase) return;
    await exec(supabase.from("memos").update({ deleted_at: null }).eq("id", memo.id));
  }, "복원 저장 실패");
}

/** 휴지통에서 영구 삭제한다(복구 불가). */
export function purgeMemo(id: string) {
  setState({ trash: state.trash.filter((m) => m.id !== id) });
  mirror(async () => {
    if (!supabase) return;
    await exec(supabase.from("memos").delete().eq("id", id));
  }, "영구 삭제 실패");
}

export function renameProject(oldName: string, newName: string) {
  const name = newName.trim();
  if (!name || name === oldName) return;
  const exists = state.projects.some((p) => p.name === name);
  const projects = exists
    ? state.projects.filter((p) => p.name !== oldName) // 같은 이름이 이미 있으면 합친다
    : state.projects.map((p) => (p.name === oldName ? { ...p, name } : p));
  const remap = (m: Memo) => (m.project === oldName ? { ...m, project: name } : m);
  setState({ projects, memos: state.memos.map(remap), trash: state.trash.map(remap) });
  mirror(async () => {
    if (!supabase) return;
    if (!exists) {
      // 새 이름 행 먼저 만들고(FK), 메모 재지정, 옛 행 삭제.
      const created = projects.find((p) => p.name === name);
      if (created) await upsertProjectRow(created);
    }
    await exec(supabase.from("memos").update({ project: name }).eq("project", oldName));
    await exec(supabase.from("projects").delete().eq("name", oldName));
  }, "프로젝트 이름 변경 실패");
}

/**
 * 빈 프로젝트를 만든다. 이미 있으면 그대로 둔다.
 * 반환: 정리된 프로젝트명(빈 문자열이면 생성 안 됨).
 */
export function addProject(name: string): string {
  const n = name.trim();
  if (!n || n === "미분류" || n === "분류 없음") return "";
  if (!state.projects.some((p) => p.name === n)) {
    const created = { name: n, createdAt: Date.now() };
    setState({ projects: [...state.projects, created] });
    mirror(() => upsertProjectRow(created), "프로젝트 생성 실패");
  }
  return n;
}

/** 프로젝트를 삭제한다. 안에 있던 메모는 잃지 않고 미분류로 옮긴다. */
export function deleteProject(name: string) {
  const remap = (m: Memo) => (m.project === name ? { ...m, project: null } : m);
  setState({
    projects: state.projects.filter((p) => p.name !== name),
    memos: state.memos.map(remap),
    trash: state.trash.map(remap),
  });
  mirror(async () => {
    if (!supabase) return;
    // 메모를 먼저 미분류로 옮긴 뒤 프로젝트 행 삭제(데이터 손실 없음).
    await exec(supabase.from("memos").update({ project: null }).eq("project", name));
    await exec(supabase.from("projects").delete().eq("name", name));
  }, "프로젝트 삭제 실패");
}

export function shareMemo(id: string) {
  setState({
    memos: state.memos.map((m) => (m.id === id ? { ...m, shared: true } : m)),
  });
  mirror(async () => {
    if (!supabase) return;
    await exec(supabase.from("memos").update({ shared: true }).eq("id", id));
  }, "공유 저장 실패");
}

// ---- 코멘트(로컬 폴백 전용 — Supabase 켜지면 board-comments.ts가 처리) ----

/** 팀 보드에서 메모에 코멘트를 단다(작성자 "나"). 빈 내용은 무시. */
export function addComment(memoId: string, text: string) {
  const t = text.trim();
  if (!t) return;
  const comment: Comment = {
    id: `cmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    memoId,
    author: "나",
    mine: true,
    text: t,
    time: "방금",
    createdAt: Date.now(),
  };
  setState({ comments: [...state.comments, comment] });
}

/** 코멘트를 삭제한다(목업: 내 코멘트만 UI에서 × 노출). */
export function deleteComment(id: string) {
  setState({ comments: state.comments.filter((c) => c.id !== id) });
}
