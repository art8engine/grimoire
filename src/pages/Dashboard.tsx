import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getWork, getEpisodes, getNotes } from "../lib/db";
import type { Work, Episode, Note } from "../lib/db";

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workId = Number(id);
  const [work, setWork] = useState<Work | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (id) {
      getWork(workId).then((w) => setWork(w ?? null));
      getEpisodes(workId).then(setEpisodes);
      getNotes(workId).then(setNotes);
    }
  }, [id, workId]);

  if (!work) return null;

  const latestEp = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) : 0;
  const hasDraft = episodes.some((ep) => !ep.content || ep.content === "");

  return (
    <div>
      <TopBar showBack />
      <div className="dashboard-content">
        <div className="dashboard-title">{work.title}</div>
        {work.description && <div className="dashboard-desc">{work.description}</div>}
        <div className="dashboard-cards">
          <div
            className="dashboard-card"
            onClick={() => navigate(`/work/${id}/episodes`)}
          >
            <div className="dashboard-card-label">원고</div>
            <div className="dashboard-card-sub">
              {latestEp > 0 ? (
                <>
                  {latestEp}화까지 연재중
                  <span className="dashboard-card-draft">
                    {hasDraft ? " (임시저장본 있음)" : ""}
                  </span>
                </>
              ) : (
                "아직 작성된 회차 없음"
              )}
            </div>
          </div>
          <div
            className="dashboard-card"
            onClick={() => navigate(`/work/${id}/notes`)}
          >
            <div className="dashboard-card-label">노트</div>
            <div className="dashboard-card-sub">
              {notes.length > 0 ? (
                <div className="note-tree">
                  {notes.map((n) => (
                    <div key={n.id} className="note-tree-item">- {n.name}</div>
                  ))}
                </div>
              ) : (
                "등록된 노트 없음"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
