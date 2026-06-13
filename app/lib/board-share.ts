"use client";

// 팀 보드 전용 공유 링크(FR-018·019) — 목업.
// 백엔드가 없으므로 보드(메모+코멘트) "스냅샷"을 URL 토큰에 인코딩한다.
// 어느 기기/브라우저에서 열어도 그 보드가 그대로 보인다.
// 방문자가 다는 코멘트는 메인 스토어(app/lib/store)에 저장돼 팀 보드(S009)와
// 한 곳에서 공유된다(같은 브라우저 기준). 다른 기기 표시는 스냅샷 코멘트로 보강.
// 실제 서버 토큰·권한 검증·실시간 동기화는 범위 밖(접근 제한은 화면 수준).

export type BoardSnapshot = {
  v: 1;
  project: string; // 보드명(= 프로젝트명)
  memos: { id: string; text: string; time: string }[];
  comments: { id: string; memoId: string; author: string; text: string; time: string }[];
};

// ---- UTF-8 안전 base64url ----

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 보드 스냅샷을 공유 링크 토큰으로 인코딩한다. */
export function encodeSnapshot(snapshot: BoardSnapshot): string {
  return toBase64Url(JSON.stringify(snapshot));
}

/** 토큰을 보드 스냅샷으로 디코드한다. 손상/형식 불일치면 null. */
export function decodeSnapshot(token: string): BoardSnapshot | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as BoardSnapshot;
    if (
      parsed &&
      parsed.v === 1 &&
      typeof parsed.project === "string" &&
      Array.isArray(parsed.memos) &&
      Array.isArray(parsed.comments)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
