import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initDb } from "../lib/db";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const start = Date.now();
    initDb().then(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1000 - elapsed);
      setTimeout(() => navigate("/home", { replace: true }), remaining);
    });
  }, [navigate]);

  return (
    <div className="splash">
      <span className="splash-logo">GRIMOIRE</span>
      <span className="splash-sub">A Simple Write Novels App</span>
    </div>
  );
}
