import { createElement } from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Box,
  Calendar,
  Compass,
  CreditCard,
  Flag,
  FileText,
  Gamepad2,
  Gauge,
  Gift,
  GraduationCap,
  Heart,
  Hexagon,
  Inbox,
  Layers,
  Leaf,
  Lightbulb,
  LogIn,
  MapPin,
  Megaphone,
  MessageCircle,
  Music,
  Package,
  Palette,
  PenTool,
  Puzzle,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// 프로젝트 이름 키워드 → 어울리는 아이콘. 위에서부터 먼저 맞는 규칙을 쓴다.
const RULES: [RegExp, LucideIcon][] = [
  [/결제|페이|정산|카드|구매|환불|수수료|빌링/, CreditCard],
  [/주문|장바구니|커머스|쇼핑|상품|판매/, ShoppingCart],
  [/검색|탐색|필터/, Search],
  [/온보딩|환영|시작|런칭|출시|론칭/, Rocket],
  [/로그인|계정|인증|가입|회원/, LogIn],
  [/알림|푸시|리마인드/, Bell],
  [/채팅|메시지|톡|대화|상담|문의/, MessageCircle],
  [/지도|위치|장소|배송|물류/, MapPin],
  [/디자인|UI|화면|테마|브랜드|로고/, Palette],
  [/데이터|분석|통계|지표|리포트|대시보드/, BarChart3],
  [/영상|비디오|미디어|콘텐츠|스트리밍/, Video],
  [/음악|사운드|오디오|플레이리스트/, Music],
  [/문서|회의|노트|기획|정책|약관/, FileText],
  [/마케팅|광고|프로모션|캠페인|이벤트/, Megaphone],
  [/보안|개인정보|권한/, ShieldCheck],
  [/성능|속도|최적화|고도화|개선|리뉴얼/, Gauge],
  [/설정|관리|운영|어드민/, Settings],
  [/팀|커뮤니티|친구|소셜|멤버/, Users],
  [/일정|캘린더|스케줄|예약/, Calendar],
  [/교육|학습|강의|코스|튜토리얼/, GraduationCap],
  [/게임|플레이|레벨|퀘스트/, Gamepad2],
  [/배송|포장|패키지|택배|재고/, Package],
  [/수리|개발|엔지니어|도구|툴/, Wrench],
  [/선물|혜택|쿠폰|리워드|적립/, Gift],
  [/건강|헬스|운동|의료|병원/, Heart],
  [/아이디어|영감|브레인|발상/, Lightbulb],
];

// 키워드가 안 맞을 때 — 이름으로 다양한 아이콘을 결정적으로 고른다.
// (모두 폴더로 떨어져 똑같아 보이는 문제 방지)
const FALLBACK_ICONS: LucideIcon[] = [
  Lightbulb,
  Star,
  Flag,
  Bookmark,
  Compass,
  Layers,
  Target,
  Puzzle,
  Leaf,
  Zap,
  Box,
  PenTool,
  Hexagon,
  Sparkles,
  Heart,
  Rocket,
];

// 간단한 결정적 해시 — 같은 이름이면 항상 같은 값.
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * 프로젝트 이름에 어울리는 아이콘을 고른다.
 * 1) 키워드가 맞으면 의미에 맞는 아이콘.
 * 2) 안 맞으면 이름 해시로 다양한 아이콘을 결정적으로 골라 각각 달라 보이게 한다.
 */
export function getProjectIcon(name: string): LucideIcon {
  if (name === "미분류" || name === "분류 없음") return Inbox;
  for (const [re, Icon] of RULES) {
    if (re.test(name)) return Icon;
  }
  return FALLBACK_ICONS[hashName(name) % FALLBACK_ICONS.length];
}

/**
 * 프로젝트 이름에 맞는 아이콘을 그린다. lucide 아이콘 props를 그대로 받는다.
 * (createElement로 렌더해 렌더 중 컴포넌트 생성 경고를 피한다.)
 */
export function ProjectIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  return createElement(getProjectIcon(name), props);
}
