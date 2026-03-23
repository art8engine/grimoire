export interface SlashCommandDef {
  id: string;
  label: string;
  description: string;
  template: object;
}

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

const paragraph = (text: string) => ({
  type: "paragraph",
  content: text ? [{ type: "text", text }] : [],
});

const emptyParagraph = () => ({ type: "paragraph" });

const hr = () => ({ type: "horizontalRule" });

export const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    id: "page",
    label: "빈 페이지",
    description: "빈 페이지 추가",
    template: {
      type: "doc",
      content: [emptyParagraph()],
    },
  },
  {
    id: "character",
    label: "캐릭터",
    description: "캐릭터 설정 템플릿",
    template: {
      type: "doc",
      content: [
        heading(2, "기본 정보"),
        paragraph("이름:"),
        paragraph("나이:"),
        paragraph("성별:"),
        paragraph("직업/역할:"),
        hr(),
        heading(2, "외형"),
        paragraph("외모 특징:"),
        paragraph("복장:"),
        hr(),
        heading(2, "성격"),
        paragraph("성격 요약:"),
        paragraph("장점:"),
        paragraph("단점:"),
        hr(),
        heading(2, "배경"),
        paragraph("출신:"),
        paragraph("과거사:"),
        hr(),
        heading(2, "관계"),
        paragraph(""),
        hr(),
        heading(2, "메모"),
        emptyParagraph(),
      ],
    },
  },
  {
    id: "map",
    label: "세계관/지도",
    description: "세계관 설정 템플릿",
    template: {
      type: "doc",
      content: [
        heading(2, "장소 개요"),
        paragraph("장소 이름:"),
        paragraph("위치:"),
        paragraph("분위기:"),
        hr(),
        heading(2, "지형/환경"),
        paragraph("기후:"),
        paragraph("지형 특징:"),
        paragraph("주요 랜드마크:"),
        hr(),
        heading(2, "사회/문화"),
        paragraph("주민:"),
        paragraph("문화 특징:"),
        paragraph("정치 체제:"),
        hr(),
        heading(2, "역사"),
        paragraph("주요 사건:"),
        hr(),
        heading(2, "메모"),
        emptyParagraph(),
      ],
    },
  },
  {
    id: "item",
    label: "아이템/설정",
    description: "아이템/설정 템플릿",
    template: {
      type: "doc",
      content: [
        heading(2, "아이템 정보"),
        paragraph("이름:"),
        paragraph("종류:"),
        paragraph("외형:"),
        hr(),
        heading(2, "능력/효과"),
        paragraph("기능:"),
        paragraph("제약/부작용:"),
        hr(),
        heading(2, "내력"),
        paragraph("기원:"),
        paragraph("소유자 이력:"),
        hr(),
        heading(2, "메모"),
        emptyParagraph(),
      ],
    },
  },
  {
    id: "timeline",
    label: "타임라인",
    description: "시간순 사건 정리",
    template: {
      type: "doc",
      content: [
        heading(2, "타임라인"),
        paragraph("[시점 1]"),
        paragraph("사건:"),
        paragraph("관련 인물:"),
        hr(),
        paragraph("[시점 2]"),
        paragraph("사건:"),
        paragraph("관련 인물:"),
        hr(),
        heading(2, "메모"),
        emptyParagraph(),
      ],
    },
  },
  {
    id: "plot",
    label: "플롯",
    description: "스토리 구조 정리",
    template: {
      type: "doc",
      content: [
        heading(2, "핵심 갈등"),
        paragraph(""),
        hr(),
        heading(2, "발단"),
        paragraph(""),
        hr(),
        heading(2, "전개"),
        paragraph(""),
        hr(),
        heading(2, "위기"),
        paragraph(""),
        hr(),
        heading(2, "절정"),
        paragraph(""),
        hr(),
        heading(2, "결말"),
        paragraph(""),
        hr(),
        heading(2, "메모"),
        emptyParagraph(),
      ],
    },
  },
];

// Default pages created for new works
export const DEFAULT_PAGES = [
  {
    name: "캐릭터",
    template: {
      type: "doc",
      content: [
        heading(1, "캐릭터 목록"),
        hr(),
        paragraph("이 페이지에서 캐릭터를 관리합니다."),
        paragraph("/character 로 새 캐릭터 페이지를 추가하세요."),
        emptyParagraph(),
      ],
    },
  },
  {
    name: "세계관",
    template: {
      type: "doc",
      content: [
        heading(1, "세계관"),
        hr(),
        paragraph("이 페이지에서 세계관 설정을 관리합니다."),
        paragraph("/map 으로 장소 페이지를, /item 으로 아이템 페이지를 추가하세요."),
        emptyParagraph(),
      ],
    },
  },
  {
    name: "플롯",
    template: {
      type: "doc",
      content: [
        heading(1, "플롯"),
        hr(),
        paragraph("/plot 으로 스토리 구조를, /timeline 으로 타임라인을 추가하세요."),
        emptyParagraph(),
      ],
    },
  },
];
