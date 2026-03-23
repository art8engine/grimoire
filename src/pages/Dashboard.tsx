import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getWork } from "../lib/db";
import type { Work } from "../lib/db";

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);

  useEffect(() => {
    if (id) getWork(Number(id)).then((w) => setWork(w ?? null));
  }, [id]);

  if (!work) return null;

  return (
    <div>
      <TopBar showBack />
      <div className="dashboard-content">
        <div className="dashboard-title">{work.title}</div>
        {work.description && <div className="dashboard-desc">{work.description}</div>}
        <div className="dashboard-cards">
          <div
            className="dashboard-card"
            onClick={() => navigate(`/work/${id}/editor`)}
          >
            <div className="dashboard-card-label">원고</div>
          </div>
          <div
            className="dashboard-card"
            onClick={() => navigate(`/work/${id}/notes`)}
          >
            <div className="dashboard-card-label">노트</div>
          </div>
        </div>
      </div>
    </div>
  );
}
