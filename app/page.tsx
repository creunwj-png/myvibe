import Link from "next/link";

/**
 * S001 환영 화면 — 톡캐치 최초 진입 (게스트)
 * docs/mockups/screens.md / plan.md 기준.
 * 가치 한 줄 + 던지기→정리 히어로 한 컷 + 단일 옐로 CTA + 게스트 안심 문구.
 */
export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-white px-4 py-10">
      <div className="flex w-full max-w-[480px] flex-1 flex-col items-center justify-center text-center">
        {/* Hero: 던지면 제자리에 — 던진 메모가 프로젝트로 정리되는 한 컷 */}
        <ThrowAndSortHero />

        {/* Headline: 가벼움(떠오르면 툭) + 똑똑함(정리는 알아서) */}
        <h1 className="mt-9 text-[30px] font-bold leading-[1.25] tracking-tight text-[#1e1e1e] sm:text-[34px]">
          떠오르면 툭,
          <br />
          정리는 알아서.
        </h1>

        {/* Subcopy */}
        <p className="mt-4 text-[16px] leading-[1.5] text-[#666666]">
          키워드만 던지면 AI가
          <br className="sm:hidden" /> 프로젝트로 정리해드려요.
        </p>
      </div>

      {/* Actions: 단일 옐로 CTA + 게스트 안심 문구 */}
      <div className="w-full max-w-[480px] pb-2">
        <Link
          href="/capture"
          className="flex h-[54px] w-full items-center justify-center rounded-xl bg-[#fee500] text-[17px] font-bold text-[#1e1e1e] transition-transform duration-150 active:scale-[0.99]"
        >
          바로 시작하기
        </Link>
        <p className="mt-4 text-center text-[13px] leading-[1.54] text-[#999999]">
          로그인 없이 시작
        </p>
        <p className="mt-2 text-center text-[11px] leading-none text-[#cccccc]">
          v{process.env.NEXT_PUBLIC_APP_VERSION} · {process.env.NEXT_PUBLIC_APP_COMMIT}
        </p>
      </div>
    </main>
  );
}

/**
 * 던지기→정리 히어로.
 * 손으로 던진 메모(왼쪽 위)가 점선 궤적을 그리며 프로젝트 목록 중
 * 한 칸(옐로)에 가서 정리됨(체크)을 한 컷으로 보여준다.
 * 옐로는 "안전하게 안착했다"는 단일 시그널로만 사용 (docs/DESIGN.md §1·§2).
 */
function ThrowAndSortHero() {
  return (
    <svg
      viewBox="0 0 280 200"
      role="img"
      aria-label="던진 메모가 프로젝트 목록의 한 칸으로 정리되는 모습"
      className="h-auto w-[208px] sm:w-[232px]"
    >
      {/* 프로젝트 목록 (정리되는 곳) */}
      {/* 위 칸 — 빈 프로젝트 */}
      <rect
        x="92"
        y="90"
        width="150"
        height="26"
        rx="9"
        fill="#ffffff"
        stroke="#e5e5e5"
        strokeWidth="1.5"
      />
      <rect x="102" y="97" width="16" height="12" rx="3" fill="none" stroke="#bbbbbb" strokeWidth="1.5" />
      <rect x="126" y="101" width="64" height="4" rx="2" fill="#e5e5e5" />

      {/* 가운데 칸 — 메모가 안착한 곳 (시그널 옐로) */}
      <rect x="86" y="123" width="160" height="30" rx="10" fill="#fee500" />
      <rect x="98" y="132" width="16" height="12" rx="3" fill="#1e1e1e" />
      <rect x="122" y="136" width="74" height="4" rx="2" fill="#1e1e1e" opacity="0.55" />
      {/* 정리 완료 체크 */}
      <path
        d="M212 138 l5 5 l9 -10"
        fill="none"
        stroke="#1e1e1e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 아래 칸 — 빈 프로젝트 */}
      <rect
        x="92"
        y="160"
        width="150"
        height="26"
        rx="9"
        fill="#ffffff"
        stroke="#e5e5e5"
        strokeWidth="1.5"
      />
      <rect x="102" y="167" width="16" height="12" rx="3" fill="none" stroke="#bbbbbb" strokeWidth="1.5" />
      <rect x="126" y="171" width="50" height="4" rx="2" fill="#e5e5e5" />

      {/* 던지기 궤적 — 점선 + 끝 화살표 */}
      <path
        d="M64 56 C 104 64, 70 118, 92 134"
        fill="none"
        stroke="#cfcfcf"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.5 7"
      />
      <path
        d="M85 128 l8 7 l-10 3"
        fill="none"
        stroke="#cfcfcf"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 던진 메모 (살짝 기울어 떠 있음) */}
      <g className="tc-float" transform="rotate(-8 48 38)">
        <rect x="18" y="16" width="58" height="44" rx="11" fill="#f0f0f0" />
        <rect x="29" y="29" width="38" height="4.5" rx="2.25" fill="#c4c4c4" />
        <rect x="29" y="40" width="26" height="4.5" rx="2.25" fill="#d4d4d4" />
      </g>
    </svg>
  );
}
