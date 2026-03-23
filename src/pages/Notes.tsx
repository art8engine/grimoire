import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TopBar from "../components/TopBar";
import Toolbar from "../components/Toolbar";
import ContextMenu from "../components/ContextMenu";
import SlashMenu from "../components/SlashMenu";
import { SlashDetector } from "../lib/slash-command";
import { PageLink } from "../lib/page-link";
import {
  getNotes, createNote, updateNoteContent, renameNote, deleteNote,
  ensureDefaultNotes, buildNoteTree,
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
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [nameInput, setNameInput] = useState(false);
  const [pageName, setPageName] = useState("");
  const { showToolbar, fontSize } = useSettings();

  const handleSlashOpen = useCallback((pos: { top: number; left: number }) => {
    setSlashPos(pos);
    setSlashOpen(true);
  }, []);

  const handleSlashClose = useCallback(() => {
    setSlashOpen(false);
    setSlashQuery("");
  }, []);

  const slashExt = useMemo(
    () => SlashDetector(handleSlashOpen, handleSlashClose),
    [handleSlashOpen, handleSlashClose]
  );

  const handlePageLinkClick = useCallback((noteId: number) => {
    navigate(`/work/${workId}/notes/${noteId}`);
  }, [workId, navigate]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "내용을 입력하세요. /로 명령어 사용" }),
      PageLink,
      slashExt,
    ],
    content: "",
    onUpdate: ({ editor: e }) => {
      // Track slash query
      try {
        const { state } = e;
        const { $from } = state.selection;
        const text = $from.parent.textContent;
        if (text.startsWith("/") && slashOpen) {
          setSlashQuery(text.slice(1));
        }
      } catch { /* */ }
      setContent(JSON.stringify(e.getJSON()));
    },
  }, [slashExt]);

  // Click handler for page links in editor
  useEffect(() => {
    if (!editor) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("[data-page-link]") as HTMLElement | null;
      if (link) {
        const nid = link.getAttribute("data-note-id");
        if (nid) handlePageLinkClick(Number(nid));
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("click", handleClick);
    return () => dom.removeEventListener("click", handleClick);
  }, [editor, handlePageLinkClick]);

  // Load notes, ensure defaults exist
  useEffect(() => {
    if (!workId || isNaN(workId)) return;
    ensureDefaultNotes(workId).then(() => getNotes(workId)).then((n) => {
      setNotes(n);
      if (noteId) {
        const found = n.find((note) => note.id === Number(noteId));
        if (found) setActiveNote(found);
        else if (n.length > 0) setActiveNote(n[0]);
      } else if (n.length > 0) {
        setActiveNote(n[0]);
      }
    }).catch((err) => console.error("Notes load error:", err));
  }, [workId, noteId]);

  // Sync editor content
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

  const handleCreateChildPage = async (name: string) => {
    const parentId = activeNote?.id ?? null;
    try {
      const newId = await createNote(workId, name, parentId);
      // Insert page link in editor
      if (editor) {
        editor.commands.insertPageLink(newId, name);
      }
      const n = await getNotes(workId);
      setNotes(n);
    } catch (err) {
      console.error("Create note error:", err);
    }
  };

  const handleSlashSelect = (commandId: string) => {
    handleSlashClose();
    // Delete the "/" text from editor
    if (editor) {
      try {
        const { state } = editor;
        const { $from } = state.selection;
        const start = $from.start();
        const end = $from.end();
        editor.chain().deleteRange({ from: start, to: end }).run();
      } catch { /* */ }
    }
    if (commandId === "page") {
      setPageName("");
      setNameInput(true);
    }
  };

  const handleNameSubmit = () => {
    const name = pageName.trim();
    if (!name) return;
    setNameInput(false);
    setPageName("");
    handleCreateChildPage(name);
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

  const tree = buildNoteTree(notes);
  const breadcrumb = activeNote ? `노트 / ${activeNote.name}` : "노트";

  if (!editor) {
    return (
      <div className="notes-page">
        <TopBar showBack right="노트" />
        <div className="notes-loading" />
      </div>
    );
  }

  return (
    <div className="notes-page">
      <TopBar showBack right={breadcrumb} />

      <div className="notes-body">
        <div className="note-sidebar">
          {tree.map((note) => (
            <NoteTreeItem
              key={note.id}
              note={note}
              activeId={activeNote?.id ?? null}
              depth={0}
              onSelect={handleSelectNote}
              onContext={(e, n) => {
                e.preventDefault();
                setSideCtx({ x: e.clientX, y: e.clientY, note: n });
              }}
              renaming={renaming}
              renameName={renameName}
              setRenameName={setRenameName}
              onRename={handleRename}
              setRenaming={setRenaming}
            />
          ))}
        </div>

        <div className="note-content">
          <div className="note-title">
            {activeNote ? activeNote.name : "노트"}
          </div>

          {nameInput && (
            <div className="slash-input-bar">
              <span className="slash-input-label">새 페이지</span>
              <input
                className="slash-input"
                placeholder="페이지 이름"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSubmit();
                  if (e.key === "Escape") { setNameInput(false); setPageName(""); }
                }}
                autoFocus
              />
            </div>
          )}

          {showToolbar && <Toolbar editor={editor} />}

          <div className="editor-area" style={{ fontSize, position: "relative" }}>
            <EditorContent editor={editor} />
            {slashOpen && (
              <SlashMenu
                query={slashQuery}
                position={slashPos}
                onSelect={handleSlashSelect}
                onClose={handleSlashClose}
              />
            )}
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

// Recursive tree item component
function NoteTreeItem({
  note,
  activeId,
  depth,
  onSelect,
  onContext,
  renaming,
  renameName,
  setRenameName,
  onRename,
  setRenaming,
}: {
  note: Note & { children: Note[] };
  activeId: number | null;
  depth: number;
  onSelect: (n: Note) => void;
  onContext: (e: React.MouseEvent, n: Note) => void;
  renaming: Note | null;
  renameName: string;
  setRenameName: (v: string) => void;
  onRename: () => void;
  setRenaming: (n: Note | null) => void;
}) {
  return (
    <>
      <div
        className={`note-sidebar-item${activeId === note.id ? " active" : ""}`}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => onSelect(note)}
        onContextMenu={(e) => onContext(e, note)}
      >
        {renaming?.id === note.id ? (
          <input
            className="modal-input"
            style={{ padding: "2px 4px", fontSize: 12, margin: 0 }}
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRename();
              if (e.key === "Escape") setRenaming(null);
            }}
            onBlur={onRename}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          note.name
        )}
      </div>
      {(note.children as (Note & { children: Note[] })[]).map((child) => (
        <NoteTreeItem
          key={child.id}
          note={child}
          activeId={activeId}
          depth={depth + 1}
          onSelect={onSelect}
          onContext={onContext}
          renaming={renaming}
          renameName={renameName}
          setRenameName={setRenameName}
          onRename={onRename}
          setRenaming={setRenaming}
        />
      ))}
    </>
  );
}
