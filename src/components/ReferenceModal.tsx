import { useState } from "react";
import type { Note } from "../lib/db";

interface ReferenceModalProps {
  notes: Note[];
  onClose: () => void;
}

export default function ReferenceModal({ notes, onClose }: ReferenceModalProps) {
  const [selected, setSelected] = useState<Note | null>(null);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>노트 참조</span>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="modal-body">
          {selected ? (
            <>
              <button className="ref-back" onClick={() => setSelected(null)}>
                &#8592; 목록으로
              </button>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{selected.name}</div>
              <div className="ref-content">
                {selected.content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderTipTapContent(selected.content),
                    }}
                  />
                ) : (
                  <span style={{ color: "#ccc" }}>내용이 없습니다</span>
                )}
              </div>
            </>
          ) : notes.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 13, padding: "12px 0" }}>
              등록된 노트가 없습니다
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="ref-item"
                onClick={() => setSelected(note)}
              >
                {note.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function renderTipTapContent(json: string): string {
  try {
    const doc = JSON.parse(json);
    if (!doc.content) return "";
    return doc.content
      .map((node: { type: string; content?: { text?: string }[]; attrs?: { level?: number } }) => {
        const text = node.content?.map((c) => c.text ?? "").join("") ?? "";
        if (node.type === "heading") return `<h${node.attrs?.level ?? 2}>${text}</h${node.attrs?.level ?? 2}>`;
        if (node.type === "paragraph") return `<p>${text}</p>`;
        return text;
      })
      .join("");
  } catch {
    return "";
  }
}
