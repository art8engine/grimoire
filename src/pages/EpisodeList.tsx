import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ContextMenu from "../components/ContextMenu";
import { getWork, getEpisodes, createEpisode, deleteEpisode, updateEpisodeThumbnail } from "../lib/db";
import { resizeAndEncode } from "../lib/image-upload";
import type { Work, Episode } from "../lib/db";

export default function EpisodeList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const workId = Number(id);
  const [work, setWork] = useState<Work | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [ctx, setCtx] = useState<{ x: number; y: number; ep: Episode } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingEpId, setUploadingEpId] = useState<number | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    const eps = await getEpisodes(workId);
    setEpisodes(eps);
  }, [workId]);

  useEffect(() => {
    getWork(workId).then((w) => setWork(w ?? null));
    load();
    const uploaded = searchParams.get("uploaded");
    if (uploaded) {
      setToast(`${work?.title ?? ""} ${uploaded}화 업로드 완료`);
      setSearchParams({}, { replace: true });
      setTimeout(() => setToast(""), 2500);
    }
  }, [workId, load, searchParams, setSearchParams, work?.title]);

  const handleCreateConfirm = async () => {
    setShowCreateConfirm(false);
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) + 1 : 1;
    const newId = await createEpisode(workId, nextNum);
    navigate(`/work/${workId}/editor/${newId}`);
  };

  const handleDelete = async (ep: Episode) => {
    if (!confirm(`${ep.number}화를 삭제하시겠습니까?`)) return;
    await deleteEpisode(ep.id);
    await load();
  };

  const handleThumbnailClick = (epId: number) => {
    setUploadingEpId(epId);
    fileRef.current?.click();
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingEpId) return;
    const src = await resizeAndEncode(file);
    await updateEpisodeThumbnail(uploadingEpId, src);
    setUploadingEpId(null);
    await load();
    e.target.value = "";
  };

  const latestNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) : 0;

  return (
    <div className="home">
      {toast && <div className="toast">{toast}</div>}
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/work/${workId}`)}>&#8592;</button>
        <span className="topbar-logo">GRIMOIRE</span>
        <span className="topbar-right">원고</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleThumbnailUpload}
      />

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
            <div
              className="episode-thumb"
              onClick={(e) => { e.stopPropagation(); handleThumbnailClick(ep.id); }}
              style={ep.thumbnail ? { backgroundImage: `url(${ep.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            />
            <div className="episode-list-info">
              <div className="episode-list-num">{ep.number}화</div>
              <div className="episode-list-date">
                {new Date(ep.updated_at).toLocaleDateString("ko-KR")}
              </div>
            </div>
            <button
              className="more-btn-inline"
              onClick={(e) => {
                e.stopPropagation();
                setCtx({ x: e.clientX, y: e.clientY, ep });
              }}
            >&#8942;</button>
          </div>
        ))}

        <button className="work-add-btn" onClick={() => setShowCreateConfirm(true)}>
          + {latestNum + 1}화 작성하기
        </button>
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx(null)}
          items={[
            { label: "썸네일 변경", onClick: () => handleThumbnailClick(ctx.ep.id) },
            { label: "삭제", danger: true, onClick: () => handleDelete(ctx.ep) },
          ]}
        />
      )}

      {showCreateConfirm && (
        <div className="modal-overlay" onClick={() => setShowCreateConfirm(false)}>
          <div className="modal-card modal-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "24px" }}>
              <p className="confirm-text" style={{ textAlign: "center", marginBottom: 20, fontSize: 14 }}>
                {latestNum + 1}화 작성을 시작하시겠습니까?
              </p>
              <div className="confirm-buttons">
                <button className="btn-save" onClick={() => setShowCreateConfirm(false)}>취소</button>
                <button className="btn-upload" onClick={handleCreateConfirm}>시작</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
