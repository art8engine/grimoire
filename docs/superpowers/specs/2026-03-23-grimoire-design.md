# Grimoire — Novel Writing Desktop App Design Spec

## Overview

Mac desktop app for novel writers. Minimal black/white UI, Korean-first.
Writers register works, write episodes, and maintain reference notes (characters, world-building, maps, etc.).

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Desktop | Tauri v2 | Lightweight (~10MB), native Mac feel |
| UI | React + TypeScript | Fast dev, large ecosystem |
| Editor | TipTap (ProseMirror) | WYSIWYG markdown, slash commands built-in |
| Storage | SQLite (via tauri-plugin-sql) | Structured, fast, single file |
| Styling | CSS (no framework) | Minimal B/W design, no overhead |

## Screens

### 1. Splash

- White background, "GRIMOIRE" centered in light weight, letter-spaced typography
- Shown on app launch for 1s (or until SQLite init completes), fades to Home

### 2. Home — 내 작품

- Top bar: "GRIMOIRE" logo (left), settings gear (right)
- List of registered works, each showing:
  - Title (제목)
  - One-line description (한줄 설명)
  - Episode count (N화)
- "+" button at bottom to create new work
- Click a work → navigate to Work Dashboard

### 3. Work Dashboard

- Top bar: back arrow + "GRIMOIRE" logo
- Work title and description displayed
- Two entry points:
  - **원고** (Manuscript) — episode editor
  - **노트** (Notes) — reference pages

### 4. Episode Editor (원고)

- Top bar: back arrow + "GRIMOIRE" + work title (right-aligned, subtle)
- Episode tabs: horizontal tab bar showing "1화", "2화", ... "N화", "+"
- Optional formatting toolbar: B, I, H1, H2, HR — toggleable via settings
- TipTap WYSIWYG editor area:
  - Markdown syntax auto-renders in real-time (Notion-like)
  - Full-width, distraction-free writing space
- **Shift+Tab**: opens reference modal overlay

### 5. Reference Modal (Shift+Tab)

- Semi-transparent backdrop overlay
- Centered white modal card
- Lists all note pages (캐릭터, 세계관, 지도, etc.)
- Click a page → shows its content in the modal (read-only)
- Close with X or Escape

### 6. Notes (노트)

- Top bar: back arrow + "GRIMOIRE"
- Left sidebar: list of note pages
  - Each page is a named entry (캐릭터, 세계관, 지도, etc.)
  - Bottom hint: "/page로 추가"
- Right content area: TipTap editor for the selected note page
- **Slash command `/page [name]`**: typing this in the notes area creates a new note page with the given name

## Data Model (SQLite)

### works
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| title | TEXT NOT NULL | Work title |
| description | TEXT | One-line description |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last modified |

### episodes
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| work_id | INTEGER FK | References works.id |
| number | INTEGER | Episode number (1-based) |
| title | TEXT | Optional episode title |
| content | TEXT | TipTap JSON document |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last modified |

UNIQUE(work_id, number). ON DELETE CASCADE from works.

### notes
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| work_id | INTEGER FK | References works.id |
| name | TEXT NOT NULL | Page name (e.g., "캐릭터") |
| content | TEXT | TipTap JSON document |
| sort_order | INTEGER | Display order in sidebar |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last modified |

## Settings

Stored in SQLite `settings` table (key-value):

| Key | Default | Description |
|-----|---------|-------------|
| show_toolbar | true | Show/hide formatting toolbar |
| font_size | 16 | Editor font size |
| lang | ko | UI language (ko primary) |

## Key Interactions

| Interaction | Where | Behavior |
|-------------|-------|----------|
| `/page [name]` | Notes editor | Creates new note page with given name |
| `Shift+Tab` | Episode editor | Opens read-only reference modal with note pages |
| `+` (work list) | Home | Opens dialog to input title + description |
| `+` (episode tab) | Episode editor | Creates next episode (auto-increments number) |
| Markdown input | Any editor | Real-time WYSIWYG rendering via TipTap |

## Design Principles

- **Minimal**: black/white only, no colors, no unnecessary decoration
- **Korean-first**: all UI labels in Korean
- **Distraction-free**: writing area is the focus, everything else fades
- **Fast**: instant navigation, no loading states for local data
- **Simple typography**: system font, light weight for headers, clean hierarchy

## Auto-Save

- 2초 idle 후 자동저장 (debounced)
- 저장 형식: TipTap JSON
- SQLite WAL mode 사용

## CRUD Operations

- 작품: 우클릭 → 수정/삭제 (확인 다이얼로그)
- 회차: 탭 우클릭 → 삭제 (후속 회차 번호 유지)
- 노트: 사이드바 우클릭 → 이름변경/삭제
- 삭제 시 CASCADE (작품 삭제 → 회차+노트 모두 삭제)

## Empty States

- 작품 없을 때: "새 작품을 만들어보세요" + "+" 버튼
- 노트 없을 때: "/page로 첫 페이지를 만들어보세요"
- 새 회차: 빈 에디터에 플레이스홀더 텍스트

## Settings Modal

- 설정 기어 클릭 → 중앙 모달
- 서식 툴바 표시 토글
- 글자 크기 조절

## Out of Scope (v1)

- Export (PDF, EPUB)
- Cloud sync
- Collaboration
- Dark mode
- Multiple languages (Korean only for now)
- Search across works
