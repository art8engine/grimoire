import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id, noteId } = useParams();
  const navigate = useNavigate();
  const workId = Number(id);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [sideCtx, setSideCtx] = useState<{ x: number; y: number; note: Note } | null>(null);
  const [renaming, setRenaming] = useState<Note | null>(null);
  const [renameName, setRenameName] = useState("");
  const [showSlashInput, setShowSlashInput] = useState(false);
  const [slashName, setSlashName] = useState("");
  const { showToolbar, fontSize } = useSettings();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "/page 이름 입력 후 Enter로 페이지 추가" }),
    ],
    content: "",
    onUpdate: ({ editor: e }) => {
      setContent(JSON.stringify(e.getJSON()));
    },
  });

  useEffect(() => {
    if (!workId || isNaN(workId)) return;
    getNotes(workId).then((n) => {
      setNotes(n);
      if (noteId) {
        const found = n.find((note) => note.id === Number(noteId));
        if (found) setActiveNote(found);
        else if (n.length > 0) setActiveNote(n[0]);
      } else if (n.length > 0) {
        setActiveNote(n[0]);
      }
    }).catch((err) => {
      console.error("Failed to load notes:", err);
    });
  }, [workId, noteId]);

  useEffect(() => {
    if (!editor || !activeNote) return;
    try {
      const parsed = activeNote.content ? JSON.parse(activeNote.content) : null;
      editor.commands.setContent(parsed ?? "");
      setContent(activeNote.content || "");
    } catch {
      editor.commands.setContent("");
      setContent("");
    }
  }, [activeNote?.id, editor]);

  const save = useCallback(
    async (c: string) => {
      if (activeNote) await updateNoteContent(activeNote.id, c);
    },
    [activeNote]
  );

  useAutoSave(content, save);

  const handleCreateNote = useCallback(async (name: string) => {
    if (activeNote && content) await updateNoteContent(activeNote.id, content);
    try {
      await createNote(workId, name);
    } catch {
      return;
    }
    const n = await getNotes(workId);
    setNotes(n);
    const created = n.find((note) => note.name === name);
    if (created) {
      setActiveNote(created);
      navigate(`/work/${workId}/notes/${created.id}`, { replace: true });
    }
  }, [workId, activeNote, content, navigate]);

  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        const { state } = editor;
        const { $from } = state.selection;
        const lineText = $from.parent.textContent.trim();
        if (lineText === "/page") {
          event.preventDefault();
          const start = $from.start();
          const end = $from.end();
          editor.chain().deleteRange({ from: start, to: end }).run();
          setSlashName("");
          setShowSlashInput(true);
        }
      }
    };
    const el = editor.view.dom;
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleSlashSubmit = () => {
    const name = slashName.trim();
    if (!name) return;
    setShowSlashInput(false);
    setSlashName("");
    handleCreateNote(name);
  };

  const handleSelectNote = async (note: Note) => {
    if (activeNote && content) await updateNoteContent(activeNote.id, content);
    setActiveNote(note);
    navigate(`/work/${workId}/notes/${note.id}`, { replace: true });
  };

  const handleRename = async () => {
    if (!renaming || !renameName.trim()) return;
    await renameNote(renaming.id, renameName.trim());
    setRenaming(null);
    const n = await getNotes(workId);
    setNotes(n);
    if (activeNote?.id === renaming.id) {
      setActiveNote(n.find((note) => note.id === renaming.id) ?? null);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!confirm(`"${note.name}" 페이지를 삭제하시겠습니까?`)) return;
    await deleteNote(note.id);
    const n = await getNotes(workId);
    setNotes(n);
    if (activeNote?.id === note.id) {
      const next = n[0] ?? null;
      setActiveNote(next);
      if (next) navigate(`/work/${workId}/notes/${next.id}`, { replace: true });
      else navigate(`/work/${workId}/notes`, { replace: true });
    }
  };

  const breadcrumb = activeNote ? `노트 / ${activeNote.name}` : "노트";

  if (!editor) {
    return (
      <div className="notes-page">
        <TopBar showBack right={breadcrumb} />
        <div className="notes-loading">에디터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <TopBar showBack right={breadcrumb} />

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
          <div className="note-title">
            {activeNote ? activeNote.name : "노트"}
          </div>

          {showSlashInput && (
            <div className="slash-input-bar">
              <span className="slash-input-label">/page</span>
              <input
                className="slash-input"
                placeholder="페이지 이름"
                value={slashName}
                onChange={(e) => setSlashName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSlashSubmit();
                  if (e.key === "Escape") { setShowSlashInput(false); setSlashName(""); }
                }}
                autoFocus
              />
            </div>
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
