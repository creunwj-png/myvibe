import { TrashScreen } from "./trash-screen";

/**
 * 휴지통 라우트.
 * 소프트 삭제된 메모를 보여주고 복원/영구삭제한다. 데이터는 공용 스토어(app/lib/store).
 */
export default function TrashPage() {
  return <TrashScreen />;
}
