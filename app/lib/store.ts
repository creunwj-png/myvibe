"use client";

import { useEffect, useSyncExternalStore } from "react";

// 클라이언트 전용 로컬 스토어 (localStorage 저장, 백엔드 없음 — 목업 범위).
// 모든 화면이 이 스토어를 공유해 던지기·분류·편집·재분류·삭제·공유가 실제로 반영된다.

export type Memo = {
  id: string;
  text: string;
  project: string | null; // 프로젝트명 또는 null(미분류)
  shared: boolean;
  time: string; // 표시용 상대 시각 라벨
  createdAt: number; // 정렬용
};

export type Project = { name: string; createdAt: number };

export type State = { projects: Project[]; memos: Memo[] };

const KEY = "tokcatch.v1";
const H = 3_600_000;
// 시드는 고정 기준시각을 써서 SSR/클라이언트 결과가 동일하게(하이드레이션 안전).
const SEED_BASE = 1_710_000_000_000;

const SEED: State = {
  projects: [
    { name: "결제개편", createdAt: SEED_BASE - 200 * H },
    { name: "온보딩리뉴얼", createdAt: SEED_BASE - 200 * H },
    { name: "검색고도화", createdAt: SEED_BASE - 200 * H },
    { name: "로그인개선", createdAt: SEED_BASE - 200 * H },
  ],
  memos: [
    { id: "p1", text: "결제 버튼 위치 다시 보기", project: "결제개편", shared: false, time: "방금", createdAt: SEED_BASE - 0.2 * H },
    { id: "p2", text: "결제 실패 리트라이 정책 정리", project: "결제개편", shared: false, time: "어제", createdAt: SEED_BASE - 26 * H },
    { id: "p3", text: "PG사 수수료 비교", project: "결제개편", shared: true, time: "2일 전", createdAt: SEED_BASE - 50 * H },
    { id: "p4", text: "정기결제 해지 플로우 점검", project: "결제개편", shared: false, time: "3일 전", createdAt: SEED_BASE - 74 * H },
    { id: "p5", text: "해외카드 수수료 케이스 모으기", project: "결제개편", shared: false, time: "4일 전", createdAt: SEED_BASE - 98 * H },
    { id: "o1", text: "환영 화면 일러스트 시안 보기", project: "온보딩리뉴얼", shared: false, time: "방금", createdAt: SEED_BASE - 0.5 * H },
    { id: "o2", text: "가입 단계 3개로 줄이기", project: "온보딩리뉴얼", shared: true, time: "어제", createdAt: SEED_BASE - 27 * H },
    { id: "o3", text: "온보딩 첫 화면 카피 다시", project: "온보딩리뉴얼", shared: false, time: "3일 전", createdAt: SEED_BASE - 75 * H },
    { id: "s1", text: "검색 결과 정렬 기준 정리", project: "검색고도화", shared: false, time: "어제", createdAt: SEED_BASE - 28 * H },
    { id: "s2", text: "오타 보정 자동완성 붙이기", project: "검색고도화", shared: false, time: "2일 전", createdAt: SEED_BASE - 52 * H },
    { id: "l1", text: "로그인 화면 A/B 테스트 해보면 어떨까", project: "로그인개선", shared: false, time: "방금", createdAt: SEED_BASE - 1 * H },
    { id: "u1", text: "회의록 공유 방식 바꾸기", project: null, shared: false, time: "어제", createdAt: SEED_BASE - 29 * H },
    { id: "u2", text: "데모 영상 길이 검토", project: null, shared: false, time: "2일 전", createdAt: SEED_BASE - 53 * H },
  ],
};

let state: State = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 무시 (목업)
  }
}

function setState(next: State) {
  state = next;
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
  return SEED;
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.memos)) {
        state = parsed;
        emit();
        return;
      }
    }
    persist(); // 첫 방문: 시드 저장
  } catch {
    // 무시
  }
}

/** 스토어 상태를 구독한다. 마운트 시 localStorage에서 1회 하이드레이션. */
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

/** 홈 표시용: 프로젝트를 최근 활동순(프로젝트 내 최신 메모 기준)으로 정렬. */
export function projectsByRecency(s: State): { name: string; count: number }[] {
  const lastActivity = (name: string) => {
    const times = s.memos.filter((m) => m.project === name).map((m) => m.createdAt);
    const proj = s.projects.find((p) => p.name === name);
    return times.length ? Math.max(...times) : proj?.createdAt ?? 0;
  };
  return [...s.projects]
    .sort((a, b) => lastActivity(b.name) - lastActivity(a.name))
    .map((p) => ({ name: p.name, count: countOf(s, p.name) }));
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

function ensureProject(s: State, name: string): Project[] {
  if (s.projects.some((p) => p.name === name)) return s.projects;
  return [...s.projects, { name, createdAt: Date.now() }];
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
  const projects = target ? ensureProject(state, target) : state.projects;
  setState({ projects, memos: [memo, ...state.memos] });
  return id;
}

export function updateMemoText(id: string, text: string) {
  setState({
    projects: state.projects,
    memos: state.memos.map((m) => (m.id === id ? { ...m, text: text.trim() } : m)),
  });
}

export function reclassifyMemo(id: string, project: string | null) {
  const projects = project ? ensureProject(state, project) : state.projects;
  setState({
    projects,
    memos: state.memos.map((m) => (m.id === id ? { ...m, project } : m)),
  });
}

export function deleteMemo(id: string) {
  setState({ projects: state.projects, memos: state.memos.filter((m) => m.id !== id) });
}

export function restoreMemo(memo: Memo) {
  if (state.memos.some((m) => m.id === memo.id)) return;
  const projects = memo.project ? ensureProject(state, memo.project) : state.projects;
  setState({ projects, memos: [memo, ...state.memos] });
}

export function renameProject(oldName: string, newName: string) {
  const name = newName.trim();
  if (!name || name === oldName) return;
  const exists = state.projects.some((p) => p.name === name);
  const projects = exists
    ? state.projects.filter((p) => p.name !== oldName) // 같은 이름이 이미 있으면 합친다
    : state.projects.map((p) => (p.name === oldName ? { ...p, name } : p));
  const memos = state.memos.map((m) =>
    m.project === oldName ? { ...m, project: name } : m
  );
  setState({ projects, memos });
}

/**
 * 빈 프로젝트를 만든다. 이미 있으면 그대로 둔다.
 * 반환: 정리된 프로젝트명(빈 문자열이면 생성 안 됨).
 */
export function addProject(name: string): string {
  const n = name.trim();
  if (!n || n === "미분류" || n === "분류 없음") return "";
  if (!state.projects.some((p) => p.name === n)) {
    setState({
      projects: [...state.projects, { name: n, createdAt: Date.now() }],
      memos: state.memos,
    });
  }
  return n;
}

/** 프로젝트를 삭제한다. 안에 있던 메모는 잃지 않고 미분류로 옮긴다. */
export function deleteProject(name: string) {
  setState({
    projects: state.projects.filter((p) => p.name !== name),
    memos: state.memos.map((m) =>
      m.project === name ? { ...m, project: null } : m
    ),
  });
}

export function shareMemo(id: string) {
  setState({
    projects: state.projects,
    memos: state.memos.map((m) => (m.id === id ? { ...m, shared: true } : m)),
  });
}
