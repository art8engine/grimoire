# Grimoire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Minimal black/white novel-writing Mac desktop app (Tauri v2 + React + TipTap + SQLite)

**Architecture:** Tauri v2 backend handles SQLite via tauri-plugin-sql. React frontend with react-router for navigation. TipTap for WYSIWYG markdown editing. All UI in Korean.

**Tech Stack:** Tauri v2, React 18, TypeScript, TipTap, SQLite, Vite

---

### Task 1: Project Scaffolding

**Files:**
- Create: `src-tauri/` (Tauri backend)
- Create: `src/` (React frontend)
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`

- [ ] **Step 1: Create Tauri + React project**

```bash
npm create tauri-app@latest grimoire-app -- --template react-ts
# Move contents to project root
mv grimoire-app/* grimoire-app/.* . 2>/dev/null; rmdir grimoire-app
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-heading @tiptap/extension-bold @tiptap/extension-italic @tiptap/extension-horizontal-rule react-router-dom
npm install -D @types/react-router-dom
```

- [ ] **Step 3: Add tauri-plugin-sql**

```bash
cd src-tauri && cargo add tauri-plugin-sql --features sqlite
```

- [ ] **Step 4: Verify dev server runs**

```bash
npm run tauri dev
```

Expected: Tauri window opens with default React page.

- [ ] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Tauri + React project"
```

---

### Task 2: SQLite Database Setup

**Files:**
- Create: `src-tauri/migrations/001_init.sql`
- Modify: `src-tauri/src/lib.rs`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write migration SQL**

Create `src-tauri/migrations/001_init.sql`:

```sql
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(work_id, number)
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(work_id, name)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('show_toolbar', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('font_size', '16');
```

- [ ] **Step 2: Configure Tauri plugin in lib.rs**

Register `tauri-plugin-sql` with SQLite and run migrations on startup.

- [ ] **Step 3: Create frontend DB helper**

Create `src/lib/db.ts` — thin wrapper around `@tauri-apps/plugin-sql` with typed query functions for works, episodes, notes, settings.

- [ ] **Step 4: Verify DB creates on launch**

```bash
npm run tauri dev
# Check ~/Library/Application Support/com.grimoire.app/ for .db file
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: SQLite database with migrations"
```

---

### Task 3: App Layout & Router

**Files:**
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `src/pages/Splash.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Editor.tsx`
- Create: `src/pages/Notes.tsx`
- Create: `src/components/TopBar.tsx`

- [ ] **Step 1: Setup router in App.tsx**

Routes:
- `/` → Splash (auto-redirect to /home after 1s)
- `/home` → Home (작품 리스트)
- `/work/:id` → Dashboard (원고/노트 선택)
- `/work/:id/editor` → Editor (회차 에디터)
- `/work/:id/notes` → Notes (노트)

- [ ] **Step 2: Create TopBar component**

"GRIMOIRE" left-aligned, light weight, letter-spacing 4px. Optional back arrow. Optional right-side text.

- [ ] **Step 3: Create Splash page**

White background, centered "GRIMOIRE" text (font-weight 300, letter-spacing 8px, font-size 36px). After 1s, navigate to `/home` with fade.

- [ ] **Step 4: Create placeholder pages**

Home, Dashboard, Editor, Notes — each with TopBar and placeholder content.

- [ ] **Step 5: Global CSS**

`src/App.css`: reset, system font, black/white palette, no colors. Body background white, text #222.

- [ ] **Step 6: Verify navigation flow**

```bash
npm run tauri dev
```

Expected: Splash → Home → click → Dashboard → Editor/Notes. All pages render with TopBar.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: app layout, router, and page shells"
```

---

### Task 4: Home Page — 작품 리스트

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/WorkList.tsx`
- Create: `src/components/CreateWorkModal.tsx`

- [ ] **Step 1: WorkList component**

Fetch works from SQLite. Render list: title, description (subtle), episode count. Click → navigate to `/work/:id`.

- [ ] **Step 2: Empty state**

No works → centered "새 작품을 만들어보세요" + large "+" button.

- [ ] **Step 3: CreateWorkModal**

"+" click → modal with 제목 input + 한줄 설명 input + 등록 button. Insert into DB, refresh list.

- [ ] **Step 4: Context menu (우클릭)**

Right-click on work → 수정/삭제. 삭제 시 확인 다이얼로그 ("정말 삭제하시겠습니까?"). CASCADE deletes episodes+notes.

- [ ] **Step 5: Verify**

Create work, see it in list, edit title, delete work.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: home page with work CRUD"
```

---

### Task 5: Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement Dashboard**

Fetch work by ID. Display title + description. Two cards: "원고" (✎ icon) and "노트" (📝 icon). Click → navigate to editor or notes.

- [ ] **Step 2: Verify**

Click work on Home → see Dashboard with title and two entry points.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: work dashboard page"
```

---

### Task 6: Episode Editor

**Files:**
- Modify: `src/pages/Editor.tsx`
- Create: `src/components/EpisodeTab.tsx`
- Create: `src/components/TipTapEditor.tsx`
- Create: `src/components/Toolbar.tsx`
- Create: `src/hooks/useAutoSave.ts`

- [ ] **Step 1: TipTapEditor component**

TipTap editor with StarterKit. WYSIWYG markdown rendering. Placeholder text: "여기에 이야기를 써보세요..."

- [ ] **Step 2: Episode tabs**

Horizontal tabs: "1화", "2화", ... "N화". Active tab highlighted (black bg, white text). "+" tab to create next episode.

- [ ] **Step 3: Toolbar component**

B, I, H1, H2, HR buttons. Apply TipTap commands on click. Visible by default, hidden when `show_toolbar` setting is false.

- [ ] **Step 4: Auto-save hook**

`useAutoSave(content, saveFunction)`: debounce 2 seconds, call save on idle. Save episode content (TipTap JSON) to SQLite.

- [ ] **Step 5: Tab context menu**

Right-click on tab → 삭제. Confirm dialog. Delete episode from DB.

- [ ] **Step 6: Wire it all together in Editor.tsx**

TopBar (← + GRIMOIRE + work title right), tabs, optional toolbar, editor area.

- [ ] **Step 7: Verify**

Create episodes, type content, switch tabs (content persists), auto-save works.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: episode editor with TipTap and auto-save"
```

---

### Task 7: Notes Page with /page Command

**Files:**
- Modify: `src/pages/Notes.tsx`
- Create: `src/components/NoteSidebar.tsx`
- Create: `src/components/SlashCommand.tsx`

- [ ] **Step 1: NoteSidebar**

Left sidebar listing note pages. Active page highlighted. Bottom hint: "/page로 추가".

- [ ] **Step 2: Note editor area**

Right side: TipTapEditor for selected note. Auto-save like episodes.

- [ ] **Step 3: /page slash command**

TipTap slash command extension. Type `/page 캐릭터` → creates new note page named "캐릭터", adds to sidebar, navigates to it.

- [ ] **Step 4: Sidebar context menu**

Right-click → 이름변경/삭제.

- [ ] **Step 5: Empty state**

No notes → "/page로 첫 페이지를 만들어보세요" centered.

- [ ] **Step 6: Verify**

Create notes via /page, edit content, rename, delete.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: notes page with /page slash command"
```

---

### Task 8: Reference Modal (Shift+Tab)

**Files:**
- Create: `src/components/ReferenceModal.tsx`
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: ReferenceModal component**

Semi-transparent backdrop. White card centered. Lists note pages for current work. Click page → shows content (read-only). Close with X or Escape.

- [ ] **Step 2: Keyboard binding**

In Editor page, listen for Shift+Tab. Prevent default. Open ReferenceModal.

- [ ] **Step 3: Verify**

In episode editor, press Shift+Tab → modal opens, shows notes, click to read, Escape to close.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Shift+Tab reference modal"
```

---

### Task 9: Settings Modal

**Files:**
- Create: `src/components/SettingsModal.tsx`
- Modify: `src/pages/Home.tsx`
- Create: `src/hooks/useSettings.ts`

- [ ] **Step 1: useSettings hook**

Read/write settings from SQLite. Returns `{ showToolbar, fontSize, updateSetting }`.

- [ ] **Step 2: SettingsModal**

Gear icon on Home → modal. Toggle: 서식 도구 표시. Slider/stepper: 글자 크기 (12-24).

- [ ] **Step 3: Apply settings**

Toolbar visibility and font size react to settings globally.

- [ ] **Step 4: Verify**

Toggle toolbar off → editor hides toolbar. Change font size → editor text changes.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: settings modal"
```

---

### Task 10: Polish & Final Verification

- [ ] **Step 1: CSS polish**

Consistent spacing, hover states, transitions (fade for splash, smooth for modals). All text Korean.

- [ ] **Step 2: Empty states**

Verify all empty states render correctly.

- [ ] **Step 3: Full flow test**

Splash → Home → 작품 등록 → Dashboard → 원고 → 회차 작성 → Shift+Tab 참조 → 노트 → /page 추가 → 설정 변경.

- [ ] **Step 4: Build production app**

```bash
npm run tauri build
```

Expected: `.dmg` file in `src-tauri/target/release/bundle/dmg/`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: polish and production build"
```
