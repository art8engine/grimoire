import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TopBar from "../components/TopBar";
import Toolbar from "../components/Toolbar";
import ReferenceModal from "../components/ReferenceModal";
import {
  getWork, getEpisodes, updateEpisodeContent, getNotes,
} from "../lib/db";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSettings } from "../hooks/useSettings";
import type { Work, Episode, Note } from "../lib/db";

export default function Editor() {
  const { id, episodeId } = useParams();
  const workId = Number(id);
  const epId = Number(episodeId);
  const [work, setWork] = useState<Work | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showRef, setShowRef] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const { showToolbar, fontSize } = useSettings();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "" }),
    ],
    content: undefined,
    onUpdate: ({ editor: e }) => {
      setContent(JSON.stringify(e.getJSON()));
    },
  });

  useEffect(() => {
    getWork(workId).then((w) => setWork(w ?? null));
    getNotes(workId).then(setNotes);
    getEpisodes(workId).then((eps) => {
      const ep = eps.find((e) => e.id === epId);
      if (ep) setEpisode(ep);
    });
  }, [workId, epId]);

  useEffect(() => {
    if (episode && editor) {
      const parsed = episode.content ? JSON.parse(episode.content) : undefined;
      editor.commands.setContent(parsed ?? "");
      setContent(episode.content || "");
    }
  }, [episode?.id, editor]);

  const save = useCallback(
    async (c: string) => {
      if (episode) await updateEpisodeContent(episode.id, c);
    },
    [episode]
  );

  useAutoSave(content, save);

  const handleManualSave = async () => {
    if (episode && content) {
      await updateEpisodeContent(episode.id, content);
      setSaveStatus("저장됨");
      setTimeout(() => setSaveStatus(""), 1500);
    }
  };

  const handleUpload = async () => {
    if (episode && content) {
      await updateEpisodeContent(episode.id, content);
      setUploadStatus("업로드 완료");
      setTimeout(() => setUploadStatus(""), 1500);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        getNotes(workId).then(setNotes);
        setShowRef(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [workId]);

  return (
    <div className="editor-page">
      <TopBar showBack right={work?.title ? `${work.title} / 원고 / ${episode?.number ?? ""}화` : ""} />

      {showToolbar && <Toolbar editor={editor} />}

      <div className="editor-area" style={{ fontSize }}>
        <EditorContent editor={editor} />
      </div>

      <div className="editor-bottom">
        <button className={`btn-save${saveStatus ? " btn-saved" : ""}`} onClick={handleManualSave}>
          {saveStatus || "임시저장"}
        </button>
        <button className="btn-upload" onClick={handleUpload}>
          {uploadStatus || "업로드"}
        </button>
      </div>

      {showRef && <ReferenceModal notes={notes} onClose={() => setShowRef(false)} />}
    </div>
  );
}
