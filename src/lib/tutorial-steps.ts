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
    text: "필명과 프로필 사진을 설정하세요.",
  },
  {
    id: "spotlight-add-work",
    type: "spotlight",
    target: ".work-poster-add",
    title: "작품 등록",
    text: "작품을 등록해볼까요? 여기를 클릭하세요.",
    position: "right",
    waitForClick: true,
    route: "/home",
  },
  {
    id: "wait-create-work",
    type: "wait",
    title: "작품 정보 입력",
    text: "제목과 설명을 입력하고 등록하세요.\n\n튜토리얼용 작품을 등록할 예정입니다.\n빠른 삭제 처리가 가능하니 걱정하지 않으셔도 됩니다.",
    waitForElement: ".work-poster:not(.work-poster-add)",
  },
  {
    id: "spotlight-work-poster",
    type: "spotlight",
    target: ".work-poster:not(.work-poster-add)",
    title: "작품 열기",
    text: "등록된 작품을 클릭하세요.",
    position: "right",
    waitForClick: true,
    route: "/home",
  },
  {
    id: "spotlight-dashboard-card",
    type: "spotlight",
    target: ".dashboard-card:first-child",
    title: "원고 관리",
    text: "원고를 눌러 회차를 작성해보세요.",
    position: "bottom",
    waitForClick: true,
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
    id: "info-editor",
    type: "info",
    title: "에디터 사용법",
    text: "여기에 소설을 작성합니다.\nCmd+B 굵게, Cmd+I 기울임, # 제목",
  },
  {
    id: "spotlight-editor-bottom",
    type: "spotlight",
    target: ".editor-bottom",
    title: "저장과 업로드",
    text: "임시저장으로 저장하고, 업로드로 완료하세요.",
    position: "top",
  },
  {
    id: "info-reference",
    type: "info",
    title: "참고 노트",
    text: "Shift+Tab으로 노트를 참조할 수 있습니다.\n글을 쓰면서 설정이나 캐릭터 정보를 확인하세요.",
  },
  {
    id: "info-slash",
    type: "info",
    title: "슬래시 명령어",
    text: "노트에서 /를 입력하면 캐릭터, 세계관 등\n템플릿을 불러올 수 있습니다.",
  },
  {
    id: "complete",
    type: "complete",
    title: "가이드 완료",
    text: "가이드가 끝났습니다.\n자유롭게 작품을 만들어보세요!",
  },
];
