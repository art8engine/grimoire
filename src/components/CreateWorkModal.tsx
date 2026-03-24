import { useState, useRef } from "react";
import { resizeAndEncode } from "../lib/image-upload";

interface CreateWorkModalProps {
  onClose: () => void;
  onSubmit: (title: string, description: string, thumbnail: string) => void;
  initial?: { title: string; description: string; thumbnail?: string };
}

export default function CreateWorkModal({ onClose, onSubmit, initial }: CreateWorkModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [thumb, setThumb] = useState(initial?.thumbnail ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), desc.trim(), thumb);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await resizeAndEncode(file);
    setThumb(src);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ padding: "24px" }}>
          <div
            className="work-thumb-upload"
            onClick={() => fileRef.current?.click()}
          >
            {thumb ? (
              <img src={thumb} className="work-thumb-img" />
            ) : (
              <span className="work-thumb-placeholder">표지 추가</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleThumbUpload}
          />
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
