import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { updateNoteContent } from "../lib/db";
import type { Note } from "../lib/db";

interface ReferenceModalProps {
  notes: Note[];
  onClose: () => void;
}

export default function ReferenceModal({ notes, onClose }: ReferenceModalProps) {
  const [selected, setSelected] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    editable: false,
    content: "",
    onUpdate: ({ editor: e }) => {
      setContent(JSON.stringify(e.getJSON()));
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(editing);
  }, [editing, editor]);

  useEffect(() => {
    if (selected && editor) {
      try {
        const parsed = selected.content ? JSON.parse(selected.content) : null;
        editor.commands.setContent(parsed ?? "");
        setContent(selected.content || "");
      } catch {
        editor.commands.setContent("");
        setContent("");
      }
      setEditing(false);
    }
  }, [selected?.id, editor]);

  const handleSave = useCallback(async () => {
    if (selected && content) {
      await updateNoteContent(selected.id, content);
    }
  }, [selected, content]);

  const handleToggleEdit = () => {
    if (editing && content) {
      handleSave();
    }
    setEditing(!editing);
  };

  const handleClose = () => {
    if (editing && content && selected) {
      handleSave();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="ref-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ref-modal-header">
          <span>노트</span>
          <div className="ref-modal-actions">
            {selected && (
              <button className="ref-edit-btn" onClick={handleToggleEdit} title={editing ? "읽기 모드" : "편집 모드"}>
                {editing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                )}
              </button>
            )}
            <button className="modal-close" onClick={handleClose}>&#10005;</button>
          </div>
        </div>

        <div className="ref-modal-body">
          <div className="ref-sidebar">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`ref-sidebar-item${selected?.id === note.id ? " active" : ""}`}
                onClick={() => setSelected(note)}
              >
                {note.name}
              </div>
            ))}
          </div>

          <div className="ref-content-area">
            {selected ? (
              <>
                <div className="ref-content-title">{selected.name}</div>
                <div className="ref-content-editor">
                  <EditorContent editor={editor} />
                </div>
              </>
            ) : (
              <div className="ref-content-empty">노트를 선택하세요</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
