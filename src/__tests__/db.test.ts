import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the @tauri-apps/plugin-sql module before importing db
vi.mock("@tauri-apps/plugin-sql", () => {
  const mockDb = {
    select: vi.fn(),
    execute: vi.fn(),
  };
  return {
    default: {
      load: vi.fn().mockResolvedValue(mockDb),
    },
    __mockDb: mockDb,
  };
});

// We need to access the mock DB instance via the module mock
import Database from "@tauri-apps/plugin-sql";

const mockDb = {
  select: vi.fn(),
  execute: vi.fn(),
};

// Override the load mock to always return mockDb
(Database.load as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

// Import db functions after mocking
import {
  getWorks,
  getWork,
  createWork,
  updateWork,
  deleteWork,
  getEpisodes,
  createEpisode,
  updateEpisodeContent,
  deleteEpisode,
  getNotes,
  createNote,
  updateNoteContent,
  renameNote,
  deleteNote,
  getSetting,
  setSetting,
} from "../lib/db";

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Works ---

describe("getWorks", () => {
  it("calls select with correct SQL and returns rows", async () => {
    const rows = [{ id: 1, title: "Test", description: "", created_at: "", updated_at: "", episode_count: 2 }];
    mockDb.select.mockResolvedValueOnce(rows);
    const result = await getWorks();
    expect(mockDb.select).toHaveBeenCalledOnce();
    expect(result).toEqual(rows);
  });
});

describe("getWork", () => {
  it("returns first row matching id", async () => {
    const row = { id: 5, title: "Novel", description: "desc", created_at: "", updated_at: "", episode_count: 0 };
    mockDb.select.mockResolvedValueOnce([row]);
    const result = await getWork(5);
    expect(result).toEqual(row);
  });

  it("returns undefined when no rows found", async () => {
    mockDb.select.mockResolvedValueOnce([]);
    const result = await getWork(999);
    expect(result).toBeUndefined();
  });
});

describe("createWork", () => {
  it("inserts work and default notes, returns lastInsertId", async () => {
    mockDb.execute.mockResolvedValue({ lastInsertId: 7 });
    const id = await createWork("My Work", "A description");
    expect(id).toBe(7);
    // First call: INSERT INTO works
    expect(mockDb.execute.mock.calls[0][0]).toContain("INSERT INTO works");
    // Subsequent calls: INSERT INTO notes (3 default notes)
    const noteCalls = mockDb.execute.mock.calls.slice(1);
    expect(noteCalls).toHaveLength(3);
    noteCalls.forEach((call: unknown[]) => {
      expect(call[0]).toContain("INSERT INTO notes");
    });
  });
});

describe("updateWork", () => {
  it("calls execute with UPDATE works SQL", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await updateWork(1, "New Title", "New Desc");
    expect(mockDb.execute.mock.calls[0][0]).toContain("UPDATE works");
    expect(mockDb.execute.mock.calls[0][1]).toEqual(["New Title", "New Desc", 1]);
  });
});

describe("deleteWork", () => {
  it("calls execute with DELETE FROM works", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await deleteWork(3);
    expect(mockDb.execute.mock.calls[0][0]).toContain("DELETE FROM works");
    expect(mockDb.execute.mock.calls[0][1]).toEqual([3]);
  });
});

// --- Episodes ---

describe("getEpisodes", () => {
  it("returns episodes for workId", async () => {
    const rows = [{ id: 1, work_id: 2, number: 1, title: "", content: "", created_at: "", updated_at: "" }];
    mockDb.select.mockResolvedValueOnce(rows);
    const result = await getEpisodes(2);
    expect(result).toEqual(rows);
    expect(mockDb.select.mock.calls[0][1]).toEqual([2]);
  });
});

describe("createEpisode", () => {
  it("returns lastInsertId", async () => {
    mockDb.execute.mockResolvedValueOnce({ lastInsertId: 10 });
    const id = await createEpisode(1, 3);
    expect(id).toBe(10);
  });
});

describe("updateEpisodeContent", () => {
  it("calls UPDATE episodes with correct params", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await updateEpisodeContent(5, "content here");
    expect(mockDb.execute.mock.calls[0][0]).toContain("UPDATE episodes");
    expect(mockDb.execute.mock.calls[0][1]).toEqual(["content here", 5]);
  });
});

describe("deleteEpisode", () => {
  it("calls DELETE FROM episodes", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await deleteEpisode(8);
    expect(mockDb.execute.mock.calls[0][0]).toContain("DELETE FROM episodes");
    expect(mockDb.execute.mock.calls[0][1]).toEqual([8]);
  });
});

// --- Notes ---

describe("getNotes", () => {
  it("returns notes for workId", async () => {
    const rows = [{ id: 1, work_id: 1, name: "메인 노트", content: "", sort_order: 0, created_at: "", updated_at: "" }];
    mockDb.select.mockResolvedValueOnce(rows);
    const result = await getNotes(1);
    expect(result).toEqual(rows);
    expect(mockDb.select.mock.calls[0][1]).toEqual([1]);
  });
});

describe("createNote", () => {
  it("returns lastInsertId", async () => {
    mockDb.execute.mockResolvedValueOnce({ lastInsertId: 99 });
    const id = await createNote(2, "새 노트");
    expect(id).toBe(99);
    expect(mockDb.execute.mock.calls[0][0]).toContain("INSERT INTO notes");
  });
});

describe("updateNoteContent", () => {
  it("calls UPDATE notes with correct params", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await updateNoteContent(3, '{"type":"doc"}');
    expect(mockDb.execute.mock.calls[0][0]).toContain("UPDATE notes");
    expect(mockDb.execute.mock.calls[0][1]).toEqual(['{"type":"doc"}', 3]);
  });
});

describe("renameNote", () => {
  it("calls UPDATE notes SET name", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await renameNote(4, "캐릭터 설정");
    expect(mockDb.execute.mock.calls[0][0]).toContain("UPDATE notes SET name");
    expect(mockDb.execute.mock.calls[0][1]).toEqual(["캐릭터 설정", 4]);
  });
});

describe("deleteNote", () => {
  it("calls DELETE FROM notes", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await deleteNote(6);
    expect(mockDb.execute.mock.calls[0][0]).toContain("DELETE FROM notes");
    expect(mockDb.execute.mock.calls[0][1]).toEqual([6]);
  });
});

// --- Settings ---

describe("getSetting", () => {
  it("returns value when key exists", async () => {
    mockDb.select.mockResolvedValueOnce([{ value: "true" }]);
    const result = await getSetting("show_toolbar");
    expect(result).toBe("true");
  });

  it("returns null when key not found", async () => {
    mockDb.select.mockResolvedValueOnce([]);
    const result = await getSetting("nonexistent");
    expect(result).toBeNull();
  });
});

describe("setSetting", () => {
  it("calls INSERT OR REPLACE INTO settings", async () => {
    mockDb.execute.mockResolvedValueOnce({});
    await setSetting("font_size", "18");
    expect(mockDb.execute.mock.calls[0][0]).toContain("INSERT OR REPLACE INTO settings");
    expect(mockDb.execute.mock.calls[0][1]).toEqual(["font_size", "18"]);
  });
});
