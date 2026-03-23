# Grimoire Project Guidelines

## Development Rules

1. **끊지 마라** - 작업 중간에 멈추고 질문하지 마라. 한번 시작하면 끝까지 해라.
2. **테스트 먼저** - 코드 수정 후 반드시 동작 확인하고 나서 완료라고 해라. "됐을 겁니다"는 금지.
3. **요청 무시 금지** - 유저가 요청한 건 전부 반영해라. 빠뜨리면 안 된다.
4. **빈 약속 금지** - "하겠습니다"만 하고 안 하면 안 된다. 말하면 바로 해라.
5. **에러 근본 원인 해결** - catch만 추가하지 말고 왜 에러가 나는지 원인을 찾아서 고쳐라.
6. **심플하게** - 안내 텍스트, 이모티콘, "~해보세요" 같은 문구 넣지 마라.
7. **한국어 메인** - UI 텍스트는 전부 한국어.

## Tech Stack

- Tauri v2 + React + TypeScript
- TipTap (WYSIWYG markdown editor)
- SQLite (via tauri-plugin-sql)
- Vite
- CSS (no framework), black/white minimal design

## Project Structure

- `src/pages/` - page components (Splash, Home, Dashboard, EpisodeList, Editor, Notes, Profile)
- `src/components/` - shared components (TopBar, Toolbar, ContextMenu, CreateWorkModal, ReferenceModal, SettingsModal)
- `src/hooks/` - custom hooks (useAutoSave, useSettings)
- `src/lib/db.ts` - SQLite database layer
- `src-tauri/` - Tauri backend (Rust)
