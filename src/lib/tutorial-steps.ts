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
  waitForElementGone?: string;
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
    id: "hint-type",
    type: "wait",
    title: "글을 써보세요",
    text: "에디터에 아무 글이나 입력해보세요.\n글을 입력하면 다음 단계로 넘어갑니다.",
    waitForElement: ".editor-a4 .tiptap p:not(.is-editor-empty)",
  },
  {
    id: "hint-bold",
    type: "wait",
    title: "굵게 만들기",
    text: "텍스트를 선택한 후 Cmd+B를 눌러보세요.\n또는 툴바의 B 버튼을 클릭하세요.",
    waitForElement: ".editor-a4 .tiptap strong",
  },
  {
    id: "hint-heading",
    type: "wait",
    title: "제목 만들기",
    text: "새 줄에서 # + 스페이스를 입력하면 제목이 됩니다.\n또는 툴바의 H1 버튼을 클릭하세요.",
    waitForElement: ".editor-a4 .tiptap h1,.editor-a4 .tiptap h2",
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
    id: "hint-shift-tab",
    type: "wait",
    title: "참고 노트 열기",
    text: "Shift+Tab을 눌러보세요.\n글을 쓰면서 노트를 참조할 수 있습니다.",
    waitForElement: ".ref-modal",
  },
  {
    id: "hint-ref-done",
    type: "wait",
    title: "참고 노트",
    text: "노트를 확인하고 연필 아이콘으로 수정도 가능합니다.\nESC 또는 X를 눌러 닫으세요.",
    waitForElementGone: ".ref-modal",
  },

  // Phase 5: Notes (노트)
  {
    id: "spotlight-back-btn",
    type: "spotlight",
    target: ".topbar-back",
    title: "노트 알아보기",
    text: "이제 노트를 알아볼까요?\n좌측 상단의 뒤로가기를 눌러주세요.",
    position: "bottom",
    waitForClick: true,
  },
  {
    id: "wait-dashboard-2",
    type: "wait",
    title: "대시보드",
    text: "이동 중...",
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
    id: "hint-notes-intro",
    type: "wait",
    title: "노트",
    text: "이곳에서 작품의 디테일을 기록합니다.\n좌측에 페이지 목록, 우측에서 편집합니다.\n\n에디터에 아무 글이나 입력해보세요.",
    waitForElement: ".note-content .tiptap p:not(.is-editor-empty)",
  },
  {
    id: "hint-slash-try",
    type: "wait",
    title: "슬래시 명령어",
    text: "에디터에서 /를 입력해보세요.\n명령어 메뉴가 나타납니다.\n\n/character  캐릭터 템플릿\n/map  세계관 템플릿\n/item  아이템 템플릿\n\n한글도 가능합니다. (/캐릭터, /세계관 등)",
    waitForElement: ".slash-menu",
  },
  {
    id: "hint-slash-select",
    type: "wait",
    title: "템플릿 선택",
    text: "방향키로 이동하고 Enter로 선택하세요.\n또는 마우스로 클릭하세요.",
    waitForElementGone: ".slash-menu",
  },

  // Phase 6: Complete
  {
    id: "complete",
    type: "complete",
    title: "가이드 완료",
    text: "가이드가 끝났습니다.\n자유롭게 작품을 만들어보세요!",
  },
];
