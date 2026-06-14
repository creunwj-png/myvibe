"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mic, X } from "lucide-react";
import { ProjectIcon } from "../lib/project-icon";
import { useSpeechRecognition } from "../lib/use-speech-recognition";

/**
 * S002 캡처 화면 — "1초에 던진다"의 심장.
 * 자동 포커스 입력 하나 + [던지기] + ✕ 만으로 구성. 빈 입력이면 [던지기] 비활성.
 * project가 있으면 상단에 "○○에 던지는 중" 컨텍스트 표기.
 * docs/mockups/screens.md S002 기준.
 */
export function CaptureScreen({ project }: { project?: string }) {
  const [text, setText] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // 녹음 시작 시점의 기존 입력 — 음성 결과를 이 뒤에 이어 붙인다
  const baseTextRef = useRef("");
  const canThrow = text.trim().length > 0;

  const { supported: voiceSupported, listening, toggle: toggleVoice } =
    useSpeechRecognition({
      onTranscript: (transcript) => {
        const base = baseTextRef.current;
        setText(base ? `${base} ${transcript}` : transcript);
      },
      onError: (error) => {
        setVoiceError(
          error === "not-allowed" || error === "service-not-allowed"
            ? "마이크 권한이 필요해요. 브라우저 설정에서 허용해 주세요."
            : "음성 인식에 문제가 생겼어요. 다시 시도해 주세요.",
        );
      },
    });

  function handleVoiceClick() {
    setVoiceError(null);
    if (!listening) {
      // 시작: 현재 텍스트를 기준점으로 저장(끝의 공백 정리)
      baseTextRef.current = text.trimEnd();
    } else {
      // 멈출 땐 다시 입력에 포커스
      inputRef.current?.focus();
    }
    toggleVoice();
  }

  // 열자마자 자동 포커스 (마찰 0)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleThrow() {
    if (!canThrow) return;
    const params = new URLSearchParams({ text: text.trim() });
    if (project) params.set("project", project);
    router.push(`/match?${params.toString()}`);
  }

  function handleClose() {
    // S004 홈으로 닫기 (현재 홈은 placeholder)
    router.push("/home");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // 데스크톱 보조: Enter로 던지기, Shift+Enter는 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleThrow();
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {/* Top: 닫기 + (프로젝트 컨텍스트) */}
        <header className="flex items-center gap-3 px-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-[#f8f8f8]"
          >
            <X size={24} />
          </button>
          {project ? (
            <span className="flex items-center gap-1.5 text-[13px] leading-[1.54] text-[#666666]">
              <ProjectIcon name={project} size={15} className="text-[#999999]" />
              {project}에 던지는 중
            </span>
          ) : null}
        </header>

        {/* Main: 자동 포커스 입력 — 화면 대부분을 차지 */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="여기에 툭 던지세요"
          aria-label="던질 내용"
          className="flex-1 resize-none bg-transparent px-4 pt-4 text-[18px] leading-[1.5] text-[#222222] outline-none placeholder:text-[#bbbbbb]"
        />

        {/* 음성 인식 안내/오류 */}
        {voiceError ? (
          <p
            role="alert"
            className="px-4 pb-1 text-[13px] leading-[1.54] text-[#e5484d]"
          >
            {voiceError}
          </p>
        ) : listening ? (
          <p className="px-4 pb-1 text-[13px] leading-[1.54] text-[#666666]">
            듣고 있어요… 말한 내용이 입력돼요
          </p>
        ) : null}

        {/* Action bar: 음성(FR-014) + 던지기 */}
        <div className="flex items-center justify-between gap-3 border-t border-[#f0f0f0] px-3 py-3">
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={!voiceSupported}
            aria-label={
              !voiceSupported
                ? "이 브라우저는 음성 입력을 지원하지 않아요"
                : listening
                  ? "음성 입력 멈추기"
                  : "음성으로 던지기"
            }
            aria-pressed={listening}
            title={
              !voiceSupported
                ? "이 브라우저는 음성 입력을 지원하지 않아요"
                : listening
                  ? "음성 입력 멈추기"
                  : "음성으로 던지기"
            }
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              !voiceSupported
                ? "cursor-not-allowed text-[#cccccc]"
                : listening
                  ? "animate-pulse bg-[#fdecec] text-[#e5484d]"
                  : "text-[#666666] hover:bg-[#f8f8f8]"
            }`}
          >
            <Mic size={22} />
          </button>
          <button
            type="button"
            onClick={handleThrow}
            disabled={!canThrow}
            className={`flex h-[50px] items-center gap-1.5 rounded-xl bg-[#fee500] px-6 text-[16px] font-bold text-[#1e1e1e] transition-[transform,opacity] duration-150 ${
              canThrow
                ? "opacity-100 active:scale-[0.99]"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            던지기
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
