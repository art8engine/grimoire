import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/home", { replace: true }), 1000);
  }, [navigate]);

  return (
    <div className="splash">
      <span className="splash-logo">GRIMOIRE</span>
      <span className="splash-sub">A Simple Write Novels App</span>
    </div>
  );
}
