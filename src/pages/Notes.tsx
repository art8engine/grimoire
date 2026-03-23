import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TopBar from "../components/TopBar";
import Toolbar from "../components/Toolbar";
import ContextMenu from "../components/ContextMenu";
import {
  getNotes, createNote, updateNoteContent, renameNote, deleteNote,
} from "../lib/db";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSettings } from "../hooks/useSettings";
import type { Note } from "../lib/db";

export default function Notes() {
  const { id } = useParams();
  const workId = Number(id);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [sideCtx, setSideCtx] = useState<{ x: number; y: number; note: Note } | null>(null);
  const [renaming, setRenaming] = useState<Note | null>(null);
  const [renameName, setRenameName] = useState("");
  const { showToolbar, fontSize } = useSettings();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "" }),
    ],
    content: undefined,
    onUpdate: ({ editor: e }) => {
      const text = e.state.doc.textBetween(
        Math.max(0, e.state.selection.from - 50),
        e.state.selection.from,
        " "
      );
      const match = text.match(/\/page\s+(.+)$/);
      if (match) {
        const name = match[1].trim();
        if (name) {
          const from = e.state.selection.from - match[0].length;
          const to = e.state.selection.from;
          e.chain().deleteRange({ from, to }).run();
          handleCreateNote(name);
          return;
        }
      }
      setContent(JSON.stringify(e.getJSON()));
    },
  });

  const loadNotes = useCallback(async () => {
    const n = await getNotes(workId);
    setNotes(n);
    return n;
  }, [workId]);

  useEffect(() => {
    loadNotes().then((n) => {
      if (n.length > 0) setActiveNote(n[0]);
    });
  }, [loadNotes]);

  useEffect(() => {
    if (activeNote && editor) {
      const parsed = activeNote.content ? JSON.parse(activeNote.content) : undefined;
      editor.commands.setContent(parsed ?? "");
      setContent(activeNote.content || "");
    }
  }, [activeNote?.id, editor]);

  const save = useCallback(
    async (c: string) => {
      if (activeNote) await updateNoteContent(activeNote.id, c);
    },
    [activeNote]
  );

  useAutoSave(content, save);

  const handleCreateNote = async (name: string) => {
    if (activeNote && content) await updateNoteContent(activeNote.id, content);
    try {
      await createNote(workId, name);
    } catch {
      return;
    }
    const n = await loadNotes();
    const created = n.find((note) => note.name === name);
    if (created) setActiveNote(created);
  };

  const handleSelectNote = async (note: Note) => {
    if (activeNote && content) await updateNoteContent(activeNote.id, content);
    setActiveNote(note);
  };

  const handleRename = async () => {
    if (!renaming || !renameName.trim()) return;
    await renameNote(renaming.id, renameName.trim());
    setRenaming(null);
    const n = await loadNotes();
    if (activeNote?.id === renaming.id) {
      setActiveNote(n.find((note) => note.id === renaming.id) ?? null);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!confirm(`"${note.name}" 페이지를 삭제하시겠습니까?`)) return;
    await deleteNote(note.id);
    const n = await loadNotes();
    if (activeNote?.id === note.id) {
      setActiveNote(n[0] ?? null);
    }
  };

  return (
    <div className="notes-page">
      <TopBar showBack />

      <div className="notes-body">
        <div className="note-sidebar">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-sidebar-item${activeNote?.id === note.id ? " active" : ""}`}
              onClick={() => handleSelectNote(note)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSideCtx({ x: e.clientX, y: e.clientY, note });
              }}
            >
              {renaming?.id === note.id ? (
                <input
                  className="modal-input"
                  style={{ padding: "2px 4px", fontSize: 12, margin: 0 }}
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  onBlur={handleRename}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                note.name
              )}
            </div>
          ))}
        </div>

        <div className="note-content">
          {activeNote && (
            <div className="note-title">{activeNote.name}</div>
          )}
          {showToolbar && <Toolbar editor={editor} />}
          <div className="editor-area" style={{ fontSize }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {sideCtx && (
        <ContextMenu
          x={sideCtx.x}
          y={sideCtx.y}
          onClose={() => setSideCtx(null)}
          items={[
            {
              label: "이름 변경",
              onClick: () => {
                setRenaming(sideCtx.note);
                setRenameName(sideCtx.note.name);
              },
            },
            { label: "삭제", danger: true, onClick: () => handleDelete(sideCtx.note) },
          ]}
        />
      )}
    </div>
  );
}
