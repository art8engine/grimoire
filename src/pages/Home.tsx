import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import CreateWorkModal from "../components/CreateWorkModal";
import ContextMenu from "../components/ContextMenu";
import SettingsModal from "../components/SettingsModal";
import { getWorks, createWork, updateWork, deleteWork, getSetting } from "../lib/db";
import { useSettings } from "../hooks/useSettings";
import type { Work } from "../lib/db";

interface HomeProps {
  dark?: boolean;
  onToggleDark?: () => void;
}

export default function Home({ dark, onToggleDark }: HomeProps) {
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
    const [w, name, avatar] = await Promise.all([
      getWorks(),
      getSetting("profile_name"),
      getSetting("profile_avatar"),
    ]);
    setWorks(w);
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
          <div className="work-grid">
            {works.map((w) => (
              <div
                key={w.id}
                className="work-poster"
                onClick={() => navigate(`/work/${w.id}`)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setCtx({ x: e.clientX, y: e.clientY, work: w });
                }}
              >
                <div className="work-poster-body">
                  <div className="work-poster-title">{w.title}</div>
                  {w.description && <div className="work-poster-desc">{w.description}</div>}
                </div>
                <div className="work-poster-footer">
                  <span className="work-poster-episodes">{w.episode_count ?? 0}화</span>
                </div>
              </div>
            ))}
            <div
              className="work-poster work-poster-add"
              onClick={() => setShowCreate(true)}
            >
              <span>+</span>
              <span>작품 추가하기</span>
            </div>
          </div>
        </div>

        <div className="home-profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div
            className="profile-avatar"
            style={profileAvatar ? { backgroundImage: `url(${profileAvatar})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          />
          <div className="profile-name">{profileName}</div>
          {onToggleDark && (
            <div
              className={`dark-toggle${dark ? " on" : ""}`}
              onClick={(e) => { e.stopPropagation(); onToggleDark(); }}
            >
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </div>
          )}
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
