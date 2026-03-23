import { useEffect } from "react";

interface MenuItem {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div className="context-menu" style={{ left: x, top: y }}>
      {items.map((item, i) => (
        <button
          key={i}
          className={`context-menu-item${item.danger ? " danger" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
