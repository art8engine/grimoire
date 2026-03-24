import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:grimoire.db");
  }
  return db;
}

// --- Works ---

export interface Work {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  episode_count?: number;
}

export async function getWorks(): Promise<Work[]> {
  const d = await getDb();
  return d.select<Work[]>(
    `SELECT w.*, (SELECT COUNT(*) FROM episodes e WHERE e.work_id = w.id) as episode_count
     FROM works w ORDER BY w.updated_at DESC`
  );
}

export async function getWork(id: number): Promise<Work | undefined> {
  const d = await getDb();
  const rows = await d.select<Work[]>(
    `SELECT w.*, (SELECT COUNT(*) FROM episodes e WHERE e.work_id = w.id) as episode_count
     FROM works w WHERE w.id = ?`,
    [id]
  );
  return rows[0];
}

export async function createWork(title: string, description: string): Promise<number> {
  const d = await getDb();
  const result = await d.execute(
    "INSERT INTO works (title, description) VALUES (?, ?)",
    [title, description]
  );
  const workId = result.lastInsertId ?? 0;
  await ensureDefaultNotes(workId);
  return workId;
}

export async function updateWork(id: number, title: string, description: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE works SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description, id]
  );
}

export async function deleteWork(id: number): Promise<void> {
  const d = await getDb();
  await d.execute("DELETE FROM works WHERE id = ?", [id]);
}

// --- Episodes ---

export interface Episode {
  id: number;
  work_id: number;
  number: number;
  title: string;
  content: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

export async function getEpisodes(workId: number): Promise<Episode[]> {
  const d = await getDb();
  return d.select<Episode[]>(
    "SELECT * FROM episodes WHERE work_id = ? ORDER BY number",
    [workId]
  );
}

export async function getEpisode(id: number): Promise<Episode | undefined> {
  const d = await getDb();
  const rows = await d.select<Episode[]>(
    "SELECT * FROM episodes WHERE id = ?",
    [id]
  );
  return rows[0];
}

export async function createEpisode(workId: number, number: number): Promise<number> {
  const d = await getDb();
  const result = await d.execute(
    "INSERT INTO episodes (work_id, number) VALUES (?, ?)",
    [workId, number]
  );
  return result.lastInsertId ?? 0;
}

export async function updateEpisodeTitle(id: number, title: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE episodes SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, id]
  );
}

export async function updateEpisodeNumber(id: number, number: number): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE episodes SET number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [number, id]
  );
}

export async function updateEpisodeContent(id: number, content: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE episodes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [content, id]
  );
}

export async function deleteEpisode(id: number): Promise<void> {
  const d = await getDb();
  await d.execute("DELETE FROM episodes WHERE id = ?", [id]);
}

// --- Notes ---

export interface Note {
  id: number;
  work_id: number;
  name: string;
  content: string;
  sort_order: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export async function getNotes(workId: number): Promise<Note[]> {
  const d = await getDb();
  return d.select<Note[]>(
    "SELECT * FROM notes WHERE work_id = ? ORDER BY sort_order, id",
    [workId]
  );
}

export async function createNote(workId: number, name: string, parentId: number | null = null, content: string = ""): Promise<number> {
  const d = await getDb();
  const result = await d.execute(
    "INSERT INTO notes (work_id, name, parent_id, content) VALUES (?, ?, ?, ?)",
    [workId, name, parentId, content]
  );
  return result.lastInsertId ?? 0;
}

export async function updateNoteContent(id: number, content: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [content, id]
  );
}

export async function renameNote(id: number, name: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE notes SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, id]
  );
}

export async function deleteNote(id: number): Promise<void> {
  const d = await getDb();
  await d.execute("DELETE FROM notes WHERE id = ?", [id]);
}

// --- Settings ---

export async function getSetting(key: string): Promise<string | null> {
  const d = await getDb();
  const rows = await d.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function ensureDefaultNotes(workId: number): Promise<void> {
  const { DEFAULT_PAGES } = await import("./templates");
  const d = await getDb();
  const existing = await d.select<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM notes WHERE work_id = ?",
    [workId]
  );
  if (existing[0]?.cnt === 0) {
    for (let i = 0; i < DEFAULT_PAGES.length; i++) {
      const page = DEFAULT_PAGES[i];
      await d.execute(
        "INSERT INTO notes (work_id, name, sort_order, content) VALUES (?, ?, ?, ?)",
        [workId, page.name, i, JSON.stringify(page.template)]
      );
    }
  }
}

export async function updateEpisodeThumbnail(id: number, thumbnail: string): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE episodes SET thumbnail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [thumbnail, id]
  );
}

export function buildNoteTree(notes: Note[]): (Note & { children: Note[] })[] {
  const map = new Map<number, Note & { children: Note[] }>();
  const roots: (Note & { children: Note[] })[] = [];
  for (const n of notes) {
    map.set(n.id, { ...n, children: [] });
  }
  for (const n of notes) {
    const node = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// --- Init ---

export async function initDb(): Promise<void> {
  const d = await getDb();
  await d.execute("PRAGMA journal_mode=WAL");
  await d.execute("PRAGMA foreign_keys=ON");
  await d.execute(`CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await d.execute(`CREATE TABLE IF NOT EXISTS episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_id, number)
  )`);
  await d.execute(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Migrations
  try { await d.execute("ALTER TABLE notes ADD COLUMN parent_id INTEGER REFERENCES notes(id) ON DELETE CASCADE"); } catch { /* exists */ }
  try { await d.execute("ALTER TABLE episodes ADD COLUMN thumbnail TEXT DEFAULT ''"); } catch { /* exists */ }
  // Remove old UNIQUE constraint by recreating table if needed
  try {
    const tableInfo = await d.select<{ sql: string }[]>("SELECT sql FROM sqlite_master WHERE type='table' AND name='notes'");
    if (tableInfo[0]?.sql?.includes("UNIQUE")) {
      await d.execute("ALTER TABLE notes RENAME TO notes_old");
      await d.execute(`CREATE TABLE notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        content TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        parent_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      await d.execute("INSERT INTO notes SELECT * FROM notes_old");
      await d.execute("DROP TABLE notes_old");
    }
  } catch { /* migration not needed */ }
  await d.execute(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
  await d.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('show_toolbar', 'true')");
  await d.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('font_size', '16')");
}
