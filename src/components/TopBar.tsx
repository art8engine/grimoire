import { useNavigate } from "react-router-dom";

interface TopBarProps {
  showBack?: boolean;
  right?: string;
  onGear?: () => void;
}

export default function TopBar({ showBack, right, onGear }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      {showBack && (
        <button className="topbar-back" onClick={() => navigate(-1)}>
          &#8592;
        </button>
      )}
      <span className="topbar-logo">GRIMOIRE</span>
      {right && <span className="topbar-right">{right}</span>}
      {onGear && (
        <button className="topbar-gear" onClick={onGear}>
          &#9881;
        </button>
      )}
    </div>
  );
}
