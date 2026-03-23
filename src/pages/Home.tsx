import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import CreateWorkModal from "../components/CreateWorkModal";
import ContextMenu from "../components/ContextMenu";
import SettingsModal from "../components/SettingsModal";
import { getWorks, createWork, updateWork, deleteWork, getSetting } from "../lib/db";
import { useSettings } from "../hooks/useSettings";
import type { Work } from "../lib/db";

export default function Home() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editWork, setEditWork] = useState<Work | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [ctx, setCtx] = useState<{ x: number; y: number; work: Work } | null>(null);
  const [profileName, setProfileName] = useState("Writer");
  const [profileAvatar, setProfileAvatar] = useState("");
  const settings = useSettings();

  const load = useCallback(async () => {
    setWorks(await getWorks());
    const name = await getSetting("profile_name");
    const avatar = await getSetting("profile_avatar");
    if (name) setProfileName(name);
    if (avatar) setProfileAvatar(avatar);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (title: string, description: string) => {
    await createWork(title, description);
    setShowCreate(false);
    await load();
  };

  const handleEdit = async (title: string, description: string) => {
    if (!editWork) return;
    await updateWork(editWork.id, title, description);
    setEditWork(null);
    await load();
  };

  const handleDelete = async (work: Work) => {
    if (!confirm(`"${work.title}" 작품을 삭제하시겠습니까?\n모든 회차와 노트가 삭제됩니다.`)) return;
    await deleteWork(work.id);
    await load();
  };

  return (
    <div className="home">
      <TopBar onGear={() => setShowSettings(true)} />

      <div className="home-body">
        <div className="work-list">
          <div className="section-title">작품 리스트</div>
          {works.map((w) => (
            <div
              key={w.id}
              className="work-item"
              onClick={() => navigate(`/work/${w.id}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setCtx({ x: e.clientX, y: e.clientY, work: w });
              }}
            >
              <div className="work-info">
                <div className="work-title">{w.title}</div>
                {w.description && <div className="work-desc">{w.description}</div>}
              </div>
              <div className="work-episodes">{w.episode_count ?? 0}화</div>
            </div>
          ))}
          <button className="work-add-btn" onClick={() => setShowCreate(true)}>
            + 작품 추가하기
          </button>
        </div>

        <div className="home-profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div
            className="profile-avatar"
            style={profileAvatar ? { backgroundImage: `url(${profileAvatar})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          />
          <div className="profile-name">{profileName}</div>
        </div>
      </div>

      {showCreate && (
        <CreateWorkModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {editWork && (
        <CreateWorkModal
          onClose={() => setEditWork(null)}
          onSubmit={handleEdit}
          initial={{ title: editWork.title, description: editWork.description }}
        />
      )}

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx(null)}
          items={[
            { label: "수정", onClick: () => setEditWork(ctx.work) },
            { label: "삭제", danger: true, onClick: () => handleDelete(ctx.work) },
          ]}
        />
      )}

      {showSettings && (
        <SettingsModal
          showToolbar={settings.showToolbar}
          fontSize={settings.fontSize}
          onToggleToolbar={settings.updateShowToolbar}
          onChangeFontSize={settings.updateFontSize}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
