import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TopBar from "../components/TopBar";
import Toolbar from "../components/Toolbar";
import ReferenceModal from "../components/ReferenceModal";
import {
  getWork, getEpisode, updateEpisodeContent, updateEpisodeTitle,
  updateEpisodeNumber, getNotes,
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
  const [loaded, setLoaded] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleSave = async (label: string) => {
    if (!episode) return;
    await Promise.all([
      updateEpisodeContent(episode.id, content),
      updateEpisodeTitle(episode.id, epTitle),
      updateEpisodeNumber(episode.id, Number(epNumber) || episode.number),
    ]);
    flash(label);
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
      <TopBar showBack right={work?.title ? `${work.title} / 원고` : ""} />

      <div className="editor-header">
        <input
          className="editor-ep-number"
          value={epNumber}
          onChange={(e) => setEpNumber(e.target.value.replace(/\D/g, ""))}
          onBlur={handleNumberBlur}
        />
        <span className="editor-ep-suffix">화</span>
        <input
          className="editor-ep-title"
          value={epTitle}
          onChange={(e) => setEpTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="제목 입력"
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
        <button className={`btn-save${status ? " btn-saved" : ""}`} onClick={() => handleSave("저장됨")}>
          {status || "임시저장"}
        </button>
        <button className="btn-upload" onClick={() => handleSave("업로드 완료")}>
          업로드
        </button>
      </div>

      {showRef && <ReferenceModal notes={notes} onClose={() => setShowRef(false)} />}
    </div>
  );
}
