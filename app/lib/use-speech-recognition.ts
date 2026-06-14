"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API(webkitSpeechRecognition) 래퍼 훅.
 * FR-014 음성 입력 — "말로 툭 던진다".
 *
 * 브라우저 표준이지만 TS lib.dom에 타입이 없어 최소 타입만 직접 선언한다.
 * Chrome/Edge/Safari(부분)에서 동작하며, 미지원 시 supported=false로 폴백.
 */

// ── Web Speech API 최소 타입 선언 ──────────────────────────────
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  /** 인식이 갱신될 때마다 이번 세션의 누적 텍스트(확정+잠정)를 넘겨준다. */
  onTranscript: (transcript: string) => void;
  /** 권한 거부 등 오류 시. */
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  lang = "ko-KR",
  onTranscript,
  onError,
}: UseSpeechRecognitionOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // 최신 콜백을 ref로 들고 있어, 이벤트 핸들러 재바인딩 없이 항상 최신값 호출
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      onTranscriptRef.current(transcript);
    };
    recognition.onerror = (e) => {
      // no-speech/aborted는 사용자가 그냥 멈춘 흔한 경우라 조용히 넘긴다
      if (e.error !== "no-speech" && e.error !== "aborted") {
        onErrorRef.current?.(e.error);
      }
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // 이미 시작된 상태에서 start()를 다시 부르면 InvalidStateError — 무시
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, start, stop, toggle };
}
