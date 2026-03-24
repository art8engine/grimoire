import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Toolbar from "../components/Toolbar";
import ReferenceModal from "../components/ReferenceModal";
import { resizeAndEncode } from "../lib/image-upload";
import {
  getWork, getEpisode, updateEpisodeContent, updateEpisodeTitle,
  updateEpisodeNumber, updateEpisodeThumbnail, getNotes,
} from "../lib/db";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSettings } from "../hooks/useSettings";
import type { Work, Episode, Note } from "../lib/db";

function safeParseTipTap(json: string | undefined): object | null {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

export default function Editor() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  const workId = Number(id);
  const epId = Number(episodeId);
  const [work, setWork] = useState<Work | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [content, setContent] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showRef, setShowRef] = useState(false);
  const [status, setStatus] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [uploadThumb, setUploadThumb] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(16);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const { showToolbar } = useSettings();

  // New episode (no content yet) starts in edit mode
  const isNew = loaded && episode && !episode.content;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: editing || isNew ? "" : "" }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    editable: editing || !!isNew,
    content: undefined,
    onUpdate: ({ editor: e }) => {
      setContent(JSON.stringify(e.getJSON()));
      setHasUnsaved(true);
    },
  });

  // Sync editable state
  useEffect(() => {
    if (editor) editor.setEditable(editing || !!isNew);
  }, [editing, isNew, editor]);

  const flash = useCallback((msg: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setStatus(msg);
    flashTimer.current = setTimeout(() => setStatus(""), 1500);
  }, []);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  useEffect(() => {
    if (!workId || !epId || isNaN(workId) || isNaN(epId)) return;
    Promise.all([
      getWork(workId),
      getEpisode(epId),
      getNotes(workId),
    ]).then(([w, ep, n]) => {
      setWork(w ?? null);
      setEpisode(ep ?? null);
      setNotes(n);
      if (ep) {
        setEpNumber(String(ep.number));
        setEpTitle(ep.title || "");
        setUploadThumb(ep.thumbnail || "");
        if (!ep.content) setEditing(true);
      }
      setLoaded(true);
    }).catch((err) => {
      console.error("Editor load error:", err);
      setLoaded(true);
    });
  }, [workId, epId]);

  useEffect(() => {
    if (episode && editor) {
      const parsed = safeParseTipTap(episode.content);
      editor.commands.setContent(parsed ?? "");
      setContent(episode.content || "");
    }
  }, [episode, editor]);

  const save = useCallback(
    async (c: string) => {
      if (episode && editing) await updateEpisodeContent(episode.id, c);
    },
    [episode, editing]
  );

  useAutoSave(content, save);

  const handleDraftSave = async () => {
    if (!episode) return;
    await Promise.all([
      updateEpisodeContent(episode.id, content),
      updateEpisodeTitle(episode.id, epTitle),
      updateEpisodeNumber(episode.id, Number(epNumber) || episode.number),
    ]);
    setHasUnsaved(false);
    flash("저장됨");
  };

  const handleUploadConfirm = async () => {
    if (!episode) return;
    await Promise.all([
      updateEpisodeContent(episode.id, content),
      updateEpisodeTitle(episode.id, epTitle),
      updateEpisodeNumber(episode.id, Number(epNumber) || episode.number),
      uploadThumb ? updateEpisodeThumbnail(episode.id, uploadThumb) : Promise.resolve(),
    ]);
    setShowUploadModal(false);
    navigate(`/work/${workId}/episodes?uploaded=${epNumber}`);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await resizeAndEncode(file);
    setUploadThumb(src);
  };

  const handleBack = () => {
    if (hasUnsaved && editing) setShowLeaveModal(true);
    else navigate(-1);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        setShowRef(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!loaded) return null;

  return (
    <div className="editor-page">
      <div className="topbar">
        <button className="topbar-back" onClick={handleBack}>&#8592;</button>
        <span className="topbar-logo">GRIMOIRE</span>
        <span className="topbar-right">{work?.title ? `${work.title} / 원고` : ""}</span>
        <button className="more-btn-inline" style={{ marginLeft: 8 }} onClick={() => setShowOptions(!showOptions)}>&#8942;</button>
        {showOptions && (
          <div className="options-dropdown">
            <div className="options-row">
              <span>텍스트 크기</span>
              <div className="font-size-control">
                <button className="font-size-btn" onClick={() => setEditorFontSize((s) => Math.max(12, s - 1))}>-</button>
                <span className="font-size-value">{editorFontSize}</span>
                <button className="font-size-btn" onClick={() => setEditorFontSize((s) => Math.min(28, s + 1))}>+</button>
              </div>
            </div>
            <div className="options-row">
              <span>{fullWidth ? "A4 화면" : "전체 화면"}</span>
              <div className={`toggle${fullWidth ? "" : " on"}`} onClick={() => setFullWidth(!fullWidth)} />
            </div>
          </div>
        )}
      </div>

      <div className="editor-header">
        <div className="editor-ep-badge">
          <input
            className="editor-ep-number"
            value={epNumber}
            onChange={(e) => setEpNumber(e.target.value.replace(/\D/g, ""))}
            onBlur={() => {
              if (!episode) return;
              const num = Number(epNumber);
              if (num && num !== episode.number) updateEpisodeNumber(episode.id, num);
            }}
            readOnly={!editing}
          />
          <span>화</span>
        </div>
        <input
          className="editor-ep-title"
          value={epTitle}
          onChange={(e) => setEpTitle(e.target.value)}
          onBlur={() => {
            if (episode && epTitle !== episode.title) updateEpisodeTitle(episode.id, epTitle);
          }}
          placeholder="제목"
          readOnly={!editing}
        />
      </div>

      {editing && showToolbar && <Toolbar editor={editor} />}

      <div className={`editor-scroll${fullWidth ? " full" : ""}`}>
        <div
          className={`editor-a4${fullWidth ? " full" : ""}`}
          style={{ fontSize: editorFontSize }}
          onClick={(e) => {
            if (e.target === e.currentTarget && editor && editing) {
              editor.commands.focus("end");
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {editing ? (
        <div className="editor-bottom">
          <button className={`btn-save${status ? " btn-saved" : ""}`} onClick={handleDraftSave}>
            {status || "임시저장"}
          </button>
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            업로드
          </button>
        </div>
      ) : (
        <button className="fab-edit" onClick={() => setShowEditConfirm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}

      {showEditConfirm && (
        <div className="modal-overlay" onClick={() => setShowEditConfirm(false)}>
          <div className="modal-card modal-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "24px" }}>
              <p className="confirm-text" style={{ textAlign: "center", marginBottom: 20 }}>
                {epNumber}화를 수정하시겠습니까?
              </p>
              <div className="confirm-buttons">
                <button className="btn-save" onClick={() => setShowEditConfirm(false)}>취소</button>
                <button className="btn-upload" onClick={() => { setShowEditConfirm(false); setEditing(true); }}>수정</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "24px" }}>
              <div className="upload-info">{epNumber}화{epTitle && ` — ${epTitle}`}</div>
              <div className="upload-thumb-area" onClick={() => thumbRef.current?.click()}>
                {uploadThumb ? (
                  <img src={uploadThumb} className="upload-thumb-img" />
                ) : (
                  <span className="upload-thumb-placeholder">썸네일 추가</span>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbUpload} />
              <div className="confirm-buttons">
                <button className="btn-save" onClick={() => setShowUploadModal(false)}>취소</button>
                <button className="btn-upload" onClick={handleUploadConfirm}>업로드</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-card modal-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "24px" }}>
              <p className="confirm-text" style={{ textAlign: "center", marginBottom: 20 }}>
                저장하고 이동하시겠습니까?
              </p>
              <div className="confirm-buttons">
                <button className="btn-save" onClick={() => { setShowLeaveModal(false); navigate(-1); }}>저장 안 함</button>
                <button className="btn-upload" onClick={async () => {
                  await handleDraftSave();
                  setShowLeaveModal(false);
                  navigate(-1);
                }}>저장 후 이동</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRef && <ReferenceModal notes={notes} onClose={() => setShowRef(false)} />}
    </div>
  );
}
