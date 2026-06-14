"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { onError } from "./store";

/**
 * 스토어 저장 실패 등을 사용자에게 알리는 전역 토스트.
 * store.onError를 구독한다(스토어는 React 밖이라 이벤트로 연결). layout에 1회 마운트.
 */
export function ErrorToaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    return onError((m) => setMsg(m));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex max-w-[480px] items-center gap-2.5 rounded-xl bg-[#1e1e1e] px-4 py-3 text-[14px] text-white shadow-[0px_4px_16px_rgba(0,0,0,0.24)]">
        <AlertCircle size={18} className="shrink-0 text-[#ff9b8a]" />
        <span className="leading-[1.5]">{msg}</span>
        <button
          type="button"
          onClick={() => setMsg(null)}
          aria-label="닫기"
          className="-mr-1 ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#bbbbbb] transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
