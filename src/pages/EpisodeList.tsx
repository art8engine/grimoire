import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import ContextMenu from "../components/ContextMenu";
import { getWork, getEpisodes, createEpisode, deleteEpisode } from "../lib/db";
import type { Work, Episode } from "../lib/db";

export default function EpisodeList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workId = Number(id);
  const [work, setWork] = useState<Work | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [ctx, setCtx] = useState<{ x: number; y: number; ep: Episode } | null>(null);

  const load = useCallback(async () => {
    const eps = await getEpisodes(workId);
    setEpisodes(eps);
  }, [workId]);

  useEffect(() => {
    getWork(workId).then((w) => setWork(w ?? null));
    load();
  }, [workId, load]);

  const handleCreate = async () => {
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) + 1 : 1;
    const newId = await createEpisode(workId, nextNum);
    navigate(`/work/${workId}/editor/${newId}`);
  };

  const handleDelete = async (ep: Episode) => {
    if (!confirm(`${ep.number}화를 삭제하시겠습니까?`)) return;
    await deleteEpisode(ep.id);
    await load();
  };

  const latestNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) : 0;

  return (
    <div className="home">
      <TopBar showBack right="원고" />

      <div className="episode-list">
        <div className="episode-list-header">
          <div className="episode-list-title">{work?.title}</div>
          {work?.description && <div className="episode-list-desc">{work.description}</div>}
          <div className="episode-list-progress">
            {latestNum > 0 ? `${latestNum}화까지 작성` : "작성된 회차 없음"}
          </div>
        </div>

        {episodes.map((ep) => (
          <div
            key={ep.id}
            className="episode-list-item"
            onClick={() => navigate(`/work/${workId}/editor/${ep.id}`)}
            onContextMenu={(e) => {
              e.preventDefault();
              setCtx({ x: e.clientX, y: e.clientY, ep });
            }}
          >
            <div className="episode-list-num">{ep.number}화</div>
            <div className="episode-list-date">
              {new Date(ep.updated_at).toLocaleDateString("ko-KR")}
            </div>
          </div>
        ))}

        <button className="work-add-btn" onClick={handleCreate}>
          + {latestNum + 1}화 작성하기
        </button>
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx(null)}
          items={[
            { label: "삭제", danger: true, onClick: () => handleDelete(ctx.ep) },
          ]}
        />
      )}
    </div>
  );
}
