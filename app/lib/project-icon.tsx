import { createElement } from "react";
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Folder,
  Gauge,
  Inbox,
  LogIn,
  MapPin,
  Megaphone,
  MessageCircle,
  Palette,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Video,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// 프로젝트 이름 키워드 → 어울리는 아이콘. 위에서부터 먼저 맞는 규칙을 쓴다.
const RULES: [RegExp, LucideIcon][] = [
  [/결제|페이|정산|카드|구매|환불|수수료|빌링/, CreditCard],
  [/주문|장바구니|커머스|쇼핑|상품/, ShoppingCart],
  [/검색|탐색|필터/, Search],
  [/온보딩|환영|시작|런칭|출시/, Rocket],
  [/로그인|계정|인증|가입|회원/, LogIn],
  [/알림|푸시|리마인드/, Bell],
  [/채팅|메시지|톡|대화|상담/, MessageCircle],
  [/지도|위치|장소|배송/, MapPin],
  [/디자인|UI|화면|테마|브랜드/, Palette],
  [/데이터|분석|통계|지표|리포트|대시보드/, BarChart3],
  [/영상|비디오|미디어|콘텐츠|스트리밍/, Video],
  [/문서|회의|노트|기획|정책|약관/, FileText],
  [/마케팅|광고|프로모션|캠페인|이벤트/, Megaphone],
  [/보안|개인정보|권한/, ShieldCheck],
  [/성능|속도|최적화|고도화|개선|리뉴얼/, Gauge],
  [/설정|관리|운영|어드민/, Settings],
  [/팀|커뮤니티|친구|소셜/, Users],
];

/**
 * 프로젝트 이름에 어울리는 아이콘을 고른다.
 * 매칭되는 키워드가 없으면 기본 폴더 아이콘을 쓴다.
 */
export function getProjectIcon(name: string): LucideIcon {
  if (name === "미분류" || name === "분류 없음") return Inbox;
  for (const [re, Icon] of RULES) {
    if (re.test(name)) return Icon;
  }
  return Folder;
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
