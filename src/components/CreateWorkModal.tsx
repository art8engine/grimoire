import { useState } from "react";

interface CreateWorkModalProps {
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  initial?: { title: string; description: string };
}

export default function CreateWorkModal({ onClose, onSubmit, initial }: CreateWorkModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), desc.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{initial ? "작품 수정" : "새 작품"}</span>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="modal-body">
          <input
            className="modal-input"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <input
            className="modal-input"
            placeholder="한줄 설명"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button className="modal-submit" onClick={handleSubmit}>
            {initial ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
