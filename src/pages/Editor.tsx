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
  const [uploadThumb, setUploadThumb] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const { showToolbar, fontSize } = useSettings();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "" }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: undefined,
    onUpdate: ({ editor: e }) => {
      setContent(JSON.stringify(e.getJSON()));
      setHasUnsaved(true);
    },
  });

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
      if (episode) await updateEpisodeContent(episode.id, c);
    },
    [episode]
  );

  useAutoSave(content, save);

  const handleDraftSave = async () => {
    if (!episode) return;
    await Promise.all([
      updateEpisodeContent(episode.id, content),
      updateEpisodeTitle(episode.id, epTitle),
      updateEpisodeNumber(episode.id, Number(epNumber) || episode.number),
    ]);
    flash("저장됨");
  };

  const handleUploadClick = () => {
    if (!episode) return;
    setShowUploadModal(true);
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
    navigate(`/work/${workId}/episodes`);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await resizeAndEncode(file);
    setUploadThumb(src);
  };

  const handleNumberBlur = async () => {
    if (!episode) return;
    const num = Number(epNumber);
    if (num && num !== episode.number) {
      await updateEpisodeNumber(episode.id, num);
    }
  };

  const handleTitleBlur = async () => {
    if (!episode) return;
    if (epTitle !== episode.title) {
      await updateEpisodeTitle(episode.id, epTitle);
    }
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
        <button className="topbar-back" onClick={() => {
          if (hasUnsaved) { setShowLeaveModal(true); }
          else { navigate(-1); }
        }}>&#8592;</button>
        <span className="topbar-logo">GRIMOIRE</span>
        <span className="topbar-right">{work?.title ? `${work.title} / 원고` : ""}</span>
      </div>

      <div className="editor-header">
        <div className="editor-ep-badge">
          <input
            className="editor-ep-number"
            value={epNumber}
            onChange={(e) => setEpNumber(e.target.value.replace(/\D/g, ""))}
            onBlur={handleNumberBlur}
          />
          <span>화</span>
        </div>
        <input
          className="editor-ep-title"
          value={epTitle}
          onChange={(e) => setEpTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="제목"
        />
      </div>

      {showToolbar && <Toolbar editor={editor} />}

      <div
        className="editor-area"
        style={{ fontSize }}
        onClick={(e) => {
          if (e.target === e.currentTarget && editor) {
            editor.commands.focus("end");
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="editor-bottom">
        <button className={`btn-save${status ? " btn-saved" : ""}`} onClick={handleDraftSave}>
          {status || "임시저장"}
        </button>
        <button className="btn-upload" onClick={handleUploadClick}>
          업로드
        </button>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>회차 업로드</span>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>&#10005;</button>
            </div>
            <div className="modal-body">
              <div className="upload-info">
                <span>{epNumber}화</span>
                {epTitle && <span> — {epTitle}</span>}
              </div>
              <div
                className="upload-thumb-area"
                onClick={() => thumbRef.current?.click()}
              >
                {uploadThumb ? (
                  <img src={uploadThumb} className="upload-thumb-img" />
                ) : (
                  <span className="upload-thumb-placeholder">썸네일 추가</span>
                )}
              </div>
              <input
                ref={thumbRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleThumbUpload}
              />
              <button className="modal-submit" onClick={handleUploadConfirm}>
                업로드
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-card modal-animate" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>저장하지 않은 변경사항</span>
              <button className="modal-close" onClick={() => setShowLeaveModal(false)}>&#10005;</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">저장하고 이동하시겠습니까?</p>
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
