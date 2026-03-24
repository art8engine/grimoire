export interface TutorialStep {
  id: string;
  type: "welcome" | "profile" | "spotlight" | "info" | "wait" | "complete";
  target?: string;
  title: string;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  waitForClick?: boolean;
  waitForKey?: string;
  waitForElement?: string;
  route?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // Phase 1: Welcome + Profile
  {
    id: "welcome",
    type: "welcome",
    title: "GRIMOIRE에 오신 것을 환영합니다",
    text: "소설 창작을 위한 당신만의 공간입니다.\n간단한 가이드를 통해 주요 기능을 알아보세요.",
  },
  {
    id: "profile",
    type: "profile",
    title: "프로필 설정",
    text: "작가 정보를 설정하세요.",
  },

  // Phase 2: Work Registration
  {
    id: "spotlight-add-work",
    type: "spotlight",
    target: ".work-poster-add",
    title: "작품 등록",
    text: "작품을 등록해볼까요?\n여기를 클릭하세요.",
    position: "right",
    waitForClick: true,
  },
  {
    id: "wait-create-work",
    type: "wait",
    title: "작품 정보 입력",
    text: "제목과 설명을 입력하고 등록하세요.\n\n튜토리얼용 작품을 등록할 예정입니다.\n빠른 삭제 처리가 가능하니 걱정하지 않으셔도 됩니다.",
    waitForElement: ".work-poster:not(.work-poster-add)",
  },

  // Phase 3: Open Work → Dashboard
  {
    id: "spotlight-work-poster",
    type: "spotlight",
    target: ".work-poster:not(.work-poster-add)",
    title: "작품 열기",
    text: "등록된 작품을 클릭하세요.",
    position: "right",
    waitForClick: true,
  },
  {
    id: "wait-dashboard",
    type: "wait",
    title: "작품 대시보드",
    text: "이동 중...",
    waitForElement: ".dashboard-card",
  },

  // Phase 4: Manuscript (원고)
  {
    id: "spotlight-manuscript",
    type: "spotlight",
    target: ".dashboard-card:first-child",
    title: "원고 관리",
    text: "원고를 눌러 회차를 작성해보세요.",
    position: "bottom",
    waitForClick: true,
  },
  {
    id: "wait-episode-list",
    type: "wait",
    title: "원고 목록",
    text: "이동 중...",
    waitForElement: ".work-add-btn",
  },
  {
    id: "spotlight-add-episode",
    type: "spotlight",
    target: ".work-add-btn",
    title: "새 회차 작성",
    text: "새 회차를 시작하세요.",
    position: "top",
    waitForClick: true,
  },
  {
    id: "wait-editor",
    type: "wait",
    title: "에디터",
    text: "이동 중...",
    waitForElement: ".editor-a4,.editor-scroll",
  },
  {
    id: "info-editor",
    type: "info",
    title: "원고 작성",
    text: "여기에 소설을 작성합니다.\n\nCmd+B  굵게\nCmd+I  기울임\n#  제목 (H1)\n##  소제목 (H2)",
  },
  {
    id: "spotlight-editor-bottom",
    type: "spotlight",
    target: ".editor-bottom",
    title: "저장과 업로드",
    text: "임시저장으로 중간 저장하고\n업로드로 회차를 완료하세요.",
    position: "top",
  },
  {
    id: "info-reference",
    type: "info",
    title: "참고 노트",
    text: "원고 작성 중 Shift+Tab을 누르면\n노트를 참조할 수 있습니다.\n\n설정이나 캐릭터 정보를 확인하면서 글을 쓰세요.",
  },

  // Phase 5: Notes (노트)
  {
    id: "info-go-notes",
    type: "info",
    title: "노트 알아보기",
    text: "이제 노트 기능을 알아볼까요?\n뒤로 가서 노트를 열어보겠습니다.",
  },
  {
    id: "wait-dashboard-2",
    type: "wait",
    title: "대시보드",
    text: "뒤로가기를 눌러 대시보드로 돌아가세요.",
    waitForElement: ".dashboard-card:last-child",
  },
  {
    id: "spotlight-notes-card",
    type: "spotlight",
    target: ".dashboard-card:last-child",
    title: "노트",
    text: "노트를 열어보세요.\n캐릭터, 세계관 등을 기록할 수 있습니다.",
    position: "bottom",
    waitForClick: true,
  },
  {
    id: "wait-notes",
    type: "wait",
    title: "노트",
    text: "이동 중...",
    waitForElement: ".note-sidebar",
  },
  {
    id: "info-notes",
    type: "info",
    title: "노트 사용법",
    text: "이곳에서 작품의 디테일을 기록합니다.\n\n좌측에 페이지 목록이 표시되고\n우측에서 내용을 편집합니다.",
  },
  {
    id: "info-slash",
    type: "info",
    title: "슬래시 명령어",
    text: "에디터에서 /를 입력하면 명령어 메뉴가 나타납니다.\n\n/character  캐릭터 템플릿\n/map  세계관 템플릿\n/item  아이템 템플릿\n/timeline  타임라인\n/plot  플롯 구조\n/page  빈 페이지\n\n한글도 지원됩니다. (/캐릭터, /세계관 등)",
  },

  // Phase 6: Complete
  {
    id: "complete",
    type: "complete",
    title: "가이드 완료",
    text: "가이드가 끝났습니다.\n자유롭게 작품을 만들어보세요!",
  },
];
