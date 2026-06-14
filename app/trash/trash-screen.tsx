"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, RotateCcw, Trash2 } from "lucide-react";
import {
  purgeMemo,
  restoreMemo,
  trashMemos,
  useStore,
  type Memo,
} from "../lib/store";

const UNCLASSIFIED_LABEL = "분류 없음";

/**
 * 휴지통.
 * 삭제된 메모를 최근 삭제순으로 나열하고, 복원(되살리기)·영구 삭제(복구 불가)를 제공한다.
 * 영구 삭제는 실수 방지를 위해 항목별 확인을 거친다.
 */
export function TrashScreen() {
  const s = useStore();
  const memos = trashMemos(s);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between pl-1 pr-3">
          <div className="flex items-center">
            <Link
              href="/home"
              aria-label="뒤로"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="ml-1 text-[18px] font-bold text-[#1e1e1e]">휴지통</h1>
          </div>
          <Link
            href="/home"
            aria-label="홈"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <Home size={22} />
          </Link>
        </header>

        {memos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f5]">
              <Trash2 size={24} className="text-[#bbbbbb]" />
            </span>
            <p className="text-[15px] text-[#999999]">휴지통이 비어 있어요.</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8">
            <p className="px-1 py-3 text-[13px] text-[#999999]">
              삭제한 메모는 여기서 되살리거나 완전히 지울 수 있어요.
            </p>
            <ul className="flex flex-col gap-2.5">
              {memos.map((m) => (
                <TrashItem key={m.id} memo={m} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

function TrashItem({ memo }: { memo: Memo }) {
  const [confirming, setConfirming] = useState(false);
  const projectLabel = memo.project ?? UNCLASSIFIED_LABEL;

  return (
    <li className="rounded-xl border border-[#eeeeee] bg-white px-4 py-3.5">
      <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.55] text-[#222222]">
        {memo.text}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-[12px] text-[#999999]">
        <span>{projectLabel}</span>
        <span>·</span>
        <span>{memo.time}</span>
      </div>

      {confirming ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-auto text-[13px] text-[#e02000]">완전히 지울까요?</span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-9 rounded-lg border border-[#e5e5e5] px-3 text-[13px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => purgeMemo(memo.id)}
            className="h-9 rounded-lg bg-[#e02000] px-3 text-[13px] font-bold text-white transition-transform duration-150 active:scale-[0.98]"
          >
            영구 삭제
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => restoreMemo(memo)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e5e5e5] px-3 text-[13px] font-medium text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <RotateCcw size={15} />
            복원
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[#999999] transition-colors hover:bg-[#f8f8f8] hover:text-[#e02000]"
          >
            <Trash2 size={15} />
            영구 삭제
          </button>
        </div>
      )}
    </li>
  );
}
