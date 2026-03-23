import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TopBar from "../components/TopBar";
import Toolbar from "../components/Toolbar";
import ContextMenu from "../components/ContextMenu";
import ReferenceModal from "../components/ReferenceModal";
import {
  getWork, getEpisodes, createEpisode, updateEpisodeContent,
  deleteEpisode, getNotes,
} from "../lib/db";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSettings } from "../hooks/useSettings";
import type { Work, Episode, Note } from "../lib/db";

export default function Editor() {
  const { id } = useParams();
  const workId = Number(id);
  const [work, setWork] = useState<Work | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeEp, setActiveEp] = useState<Episode | null>(null);
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showRef, setShowRef] = useState(false);
  const [tabCtx, setTabCtx] = useState<{ x: number; y: number; ep: Episode } | null>(null);
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

  const loadEpisodes = useCallback(async () => {
    const eps = await getEpisodes(workId);
    setEpisodes(eps);
    return eps;
  }, [workId]);

  useEffect(() => {
    getWork(workId).then((w) => setWork(w ?? null));
    getNotes(workId).then(setNotes);
    loadEpisodes().then((eps) => {
      if (eps.length > 0) {
        setActiveEp(eps[0]);
      }
    });
  }, [workId, loadEpisodes]);

  useEffect(() => {
    if (activeEp && editor) {
      const parsed = activeEp.content ? JSON.parse(activeEp.content) : undefined;
      editor.commands.setContent(parsed ?? "");
      setContent(activeEp.content || "");
    }
  }, [activeEp?.id, editor]);

  const save = useCallback(
    async (c: string) => {
      if (activeEp) await updateEpisodeContent(activeEp.id, c);
    },
    [activeEp]
  );

  useAutoSave(content, save);

  const handleAddEpisode = async () => {
    if (activeEp && content) await updateEpisodeContent(activeEp.id, content);
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) + 1 : 1;
    await createEpisode(workId, nextNum);
    const eps = await loadEpisodes();
    const newEp = eps.find((e) => e.number === nextNum);
    if (newEp) setActiveEp(newEp);
  };

  const handleSelectEpisode = async (ep: Episode) => {
    if (activeEp && content) await updateEpisodeContent(activeEp.id, content);
    setActiveEp(ep);
  };

  const handleDeleteEpisode = async (ep: Episode) => {
    if (!confirm(`${ep.number}화를 삭제하시겠습니까?`)) return;
    await deleteEpisode(ep.id);
    const eps = await loadEpisodes();
    if (activeEp?.id === ep.id) {
      setActiveEp(eps[0] ?? null);
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
      <TopBar showBack right={work?.title} />

      <div className="episode-tabs">
        {episodes.map((ep) => (
          <button
            key={ep.id}
            className={`episode-tab${activeEp?.id === ep.id ? " active" : ""}`}
            onClick={() => handleSelectEpisode(ep)}
            onContextMenu={(e) => {
              e.preventDefault();
              setTabCtx({ x: e.clientX, y: e.clientY, ep });
            }}
          >
            {ep.number}화
          </button>
        ))}
        <button className="episode-tab-add" onClick={handleAddEpisode}>+</button>
      </div>

      {showToolbar && <Toolbar editor={editor} />}

      <div className="editor-area" style={{ fontSize }}>
        <EditorContent editor={editor} />
      </div>

      {showRef && <ReferenceModal notes={notes} onClose={() => setShowRef(false)} />}

      {tabCtx && (
        <ContextMenu
          x={tabCtx.x}
          y={tabCtx.y}
          onClose={() => setTabCtx(null)}
          items={[
            { label: "삭제", danger: true, onClick: () => handleDeleteEpisode(tabCtx.ep) },
          ]}
        />
      )}
    </div>
  );
}
